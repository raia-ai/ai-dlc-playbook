import { spawnSync } from "node:child_process";
import {
  access,
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  rm,
  stat,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const REQUIRED_FILES = [
  "README.md",
  "docs/agent-devkit-boundary.md",
  "docs/governance.md",
  "docs/maturity-model.md",
  "docs/measurement.md",
  "docs/quick-starts.md",
  "examples/golden-path/README.md",
  "examples/golden-path/package.json",
  "examples/golden-path/review/spec-review.json",
  "examples/golden-path/scripts/run-golden-path.mjs",
  "examples/golden-path/specs/order-status.md",
  "examples/golden-path/test/order-status.test.mjs",
  "skills/spec-review/SKILL.md",
  "templates/AGENTS.md-snippet.md",
  "templates/CLAUDE.md-snippet.md",
  "templates/pilot-brief.md",
  "templates/pilot-scorecard.md",
  "workflows/knowledge-refresh.yml",
  "workflows/scripts/plan-knowledge-refresh.mjs",
];
const TEXT_EXTENSIONS = new Set([".json", ".md", ".mjs", ".yml", ".yaml"]);

async function exists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if (entry.name === ".git" || entry.name === "artifacts") continue;
    const resolved = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(resolved)));
    else if (entry.isFile()) files.push(resolved);
  }
  return files;
}

function run(command, argumentsList, cwd = ROOT) {
  const result = spawnSync(command, argumentsList, {
    cwd,
    encoding: "utf8",
    env: { ...process.env, NO_COLOR: "1" },
  });
  if (result.status !== 0) {
    throw new Error(
      `${command} ${argumentsList.join(" ")} failed:\n${result.stdout ?? ""}${result.stderr ?? ""}`,
    );
  }
  return result;
}

async function validateRequiredFiles() {
  for (const relativePath of REQUIRED_FILES) {
    if (!(await exists(path.join(ROOT, relativePath)))) {
      throw new Error(`Missing required file: ${relativePath}`);
    }
  }
  if (await exists(path.join(ROOT, "docs/devkit-spec"))) {
    throw new Error("docs/devkit-spec must not duplicate the canonical Agent DevKit repository");
  }
}

async function validateJsonAndLinks(files) {
  for (const filePath of files) {
    const extension = path.extname(filePath).toLowerCase();
    if (!TEXT_EXTENSIONS.has(extension)) continue;
    const content = await readFile(filePath, "utf8");

    if (extension === ".json") {
      try {
        JSON.parse(content);
      } catch (error) {
        throw new Error(`Invalid JSON in ${path.relative(ROOT, filePath)}: ${error.message}`);
      }
    }

    if (extension !== ".md") continue;
    const linkPattern = /\[[^\]]*\]\(([^)]+)\)/g;
    for (const match of content.matchAll(linkPattern)) {
      const destination = match[1].trim().replace(/^<|>$/g, "");
      if (
        destination.startsWith("#") ||
        destination.startsWith("http://") ||
        destination.startsWith("https://") ||
        destination.startsWith("mailto:")
      ) {
        continue;
      }

      const withoutFragment = destination.split("#", 1)[0];
      if (!withoutFragment) continue;
      const decoded = decodeURIComponent(withoutFragment);
      const resolved = path.resolve(path.dirname(filePath), decoded);
      if (resolved !== ROOT && !resolved.startsWith(`${ROOT}${path.sep}`)) {
        throw new Error(`Link escapes the repository in ${path.relative(ROOT, filePath)}: ${destination}`);
      }
      if (!(await exists(resolved))) {
        throw new Error(`Broken link in ${path.relative(ROOT, filePath)}: ${destination}`);
      }
    }
  }
}

async function validateSecurityAndBoundaries(files) {
  const textFiles = [];
  for (const filePath of files) {
    if (TEXT_EXTENSIONS.has(path.extname(filePath).toLowerCase())) {
      textFiles.push({ filePath, content: await readFile(filePath, "utf8") });
    }
  }
  const allText = textFiles.map(({ content }) => content).join("\n");
  const staleEndpointUses = textFiles.filter(({ filePath, content }) => {
    const relativePath = path.relative(ROOT, filePath);
    if (relativePath === "scripts/validate-playbook.mjs") return false;
    if (relativePath === "workflows/knowledge-refresh.yml") {
      return (
        content.includes("/external/agents/files") &&
        !content.includes("older illustrative /external/agents/files endpoint")
      );
    }
    return content.includes("/external/agents/files");
  });
  if (staleEndpointUses.length > 0) {
    throw new Error(
      `The stale endpoint is used in: ${staleEndpointUses
        .map(({ filePath }) => path.relative(ROOT, filePath))
        .join(", ")}`,
    );
  }
  if (!allText.includes("https://github.com/raia-ai/raia-agent-devkit")) {
    throw new Error("The playbook does not link to the canonical Agent DevKit repository");
  }

  const credentialPatterns = [
    /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,
    /\bgh[opsu]_[A-Za-z0-9]{20,}\b/,
    /\b(?:sk|rk|pk)_[A-Za-z0-9]{20,}\b/,
    /\b(?:api[_-]?key|secret|token)\s*[:=]\s*["'][A-Za-z0-9_./+-]{12,}["']/i,
  ];
  for (const { filePath, content } of textFiles) {
    for (const pattern of credentialPatterns) {
      if (pattern.test(content)) {
        throw new Error(`Possible credential in ${path.relative(ROOT, filePath)}`);
      }
    }
  }

  const workflow = await readFile(path.join(ROOT, "workflows/knowledge-refresh.yml"), "utf8");
  const requiredWorkflowText = [
    "permissions:\n  contents: read",
    "persist-credentials: false",
    "**Mode:** plan only — no remote write occurred.",
    "plan-knowledge-refresh.mjs",
    "/external/agent-files/*",
  ];
  for (const required of requiredWorkflowText) {
    if (!workflow.includes(required)) {
      throw new Error(`Knowledge-refresh workflow is missing required control: ${required}`);
    }
  }
  for (const forbidden of ["curl ", "secrets.", "RAIA_AGENT_SECRET_KEY"] ) {
    if (workflow.includes(forbidden)) {
      throw new Error(`Knowledge-refresh workflow contains forbidden live-write content: ${forbidden}`);
    }
  }
}

async function validateKnowledgePlanner() {
  const temporaryRepository = await mkdtemp(path.join(tmpdir(), "raia-knowledge-plan-"));
  const escapeFile = `${temporaryRepository}-escape.json`;
  const planner = path.join(ROOT, "workflows/scripts/plan-knowledge-refresh.mjs");

  try {
    await mkdir(path.join(temporaryRepository, "docs"), { recursive: true });
    run("git", ["init", "-q"], temporaryRepository);
    run("git", ["config", "user.email", "validator@example.invalid"], temporaryRepository);
    run("git", ["config", "user.name", "Playbook Validator"], temporaryRepository);

    await writeFile(path.join(temporaryRepository, "docs/example.md"), "version one\n");
    run("git", ["add", "."], temporaryRepository);
    run("git", ["commit", "-qm", "base"], temporaryRepository);
    const base = run("git", ["rev-parse", "HEAD"], temporaryRepository).stdout.trim();

    await writeFile(path.join(temporaryRepository, "docs/example.md"), "version two\n");
    run("git", ["add", "."], temporaryRepository);
    run("git", ["commit", "-qm", "head"], temporaryRepository);
    const head = run("git", ["rev-parse", "HEAD"], temporaryRepository).stdout.trim();

    const commonArguments = [
      planner,
      "--base",
      base,
      "--head",
      head,
      "--target",
      "support-docs",
    ];
    run(
      process.execPath,
      [...commonArguments, "--output", "artifacts/knowledge-refresh-plan.json"],
      temporaryRepository,
    );

    const plan = JSON.parse(
      await readFile(
        path.join(temporaryRepository, "artifacts/knowledge-refresh-plan.json"),
        "utf8",
      ),
    );
    if (
      plan.mode !== "plan_only" ||
      plan.remoteWriteAllowed !== false ||
      plan.changes?.length !== 1 ||
      plan.changes[0].path !== "docs/example.md"
    ) {
      throw new Error("Knowledge-refresh planner produced an unsafe or incomplete plan");
    }

    const escapeResult = spawnSync(
      process.execPath,
      [...commonArguments, "--output", `../${path.basename(escapeFile)}`],
      { cwd: temporaryRepository, encoding: "utf8" },
    );
    if (
      escapeResult.status === 0 ||
      !`${escapeResult.stdout ?? ""}${escapeResult.stderr ?? ""}`.includes(
        "Output must be a file below",
      ) ||
      (await exists(escapeFile))
    ) {
      throw new Error("Knowledge-refresh planner did not fail closed on an escaping output path");
    }
  } finally {
    await rm(temporaryRepository, { recursive: true, force: true });
    await rm(escapeFile, { force: true });
  }
}

async function validateExecutables(files) {
  for (const filePath of files.filter((candidate) => candidate.endsWith(".mjs"))) {
    run(process.execPath, ["--check", filePath]);
  }

  const example = path.join(ROOT, "examples/golden-path");
  run("npm", ["test"], example);
  run("npm", ["run", "dry-run"], example);

  const review = JSON.parse(
    await readFile(path.join(example, "review/spec-review.json"), "utf8"),
  );
  if (review.status !== "approved_for_local_reference_example") {
    throw new Error("Golden-path review status is not approved for the local example");
  }
  if ((review.criteria ?? []).some((criterion) => criterion.result !== "pass")) {
    throw new Error("At least one golden-path acceptance criterion is not passing");
  }

  await validateKnowledgePlanner();
}

async function main() {
  await validateRequiredFiles();
  const files = await walk(ROOT);
  await validateJsonAndLinks(files);
  await validateSecurityAndBoundaries(files);
  await validateExecutables(files);

  const fileCount = files.length;
  const byteCount = (
    await Promise.all(files.map(async (filePath) => (await stat(filePath)).size))
  ).reduce((sum, value) => sum + value, 0);
  console.log(`PLAYBOOK_VALIDATION_OK ${fileCount} files ${byteCount} bytes`);
}

main().catch((error) => {
  console.error(`PLAYBOOK_VALIDATION_FAILED: ${error.message}`);
  process.exitCode = 1;
});
