import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdir, rename, writeFile } from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const ARTIFACTS_ROOT = path.resolve(ROOT, "artifacts");
const MAX_FILE_BYTES = 1024 * 1024;
const MAX_TOTAL_BYTES = 10 * 1024 * 1024;
const TARGET_PATTERN = /^[a-z0-9][a-z0-9_-]{2,63}$/;

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function git(argumentsList, options = {}) {
  const result = spawnSync("git", argumentsList, {
    encoding: options.encoding ?? "utf8",
    maxBuffer: 20 * 1024 * 1024,
  });
  if (result.status !== 0) {
    throw new Error(
      `git ${argumentsList[0]} failed: ${(result.stderr || result.stdout || "unknown error").trim()}`,
    );
  }
  return result.stdout;
}

function parseArguments(argv) {
  const values = new Map();
  for (let index = 0; index < argv.length; index += 2) {
    const key = argv[index];
    const value = argv[index + 1];
    if (!key?.startsWith("--") || !value || value.startsWith("--")) {
      throw new Error("Expected --base, --head, --target, and --output arguments");
    }
    values.set(key, value);
  }

  const allowed = new Set(["--base", "--head", "--target", "--output"]);
  for (const key of values.keys()) {
    if (!allowed.has(key)) throw new Error(`Unsupported argument: ${key}`);
  }
  for (const key of allowed) {
    if (!values.has(key)) throw new Error(`Missing required argument: ${key}`);
  }
  if (values.size !== allowed.size) {
    throw new Error("Each required argument must be supplied exactly once");
  }

  return {
    base: values.get("--base"),
    head: values.get("--head"),
    target: values.get("--target"),
    output: values.get("--output"),
  };
}

function verifyCommit(reference, label) {
  if (!/^[0-9a-fA-F]{7,40}$/.test(reference)) {
    throw new Error(`${label} must be a 7–40 character Git SHA`);
  }
  return git(["rev-parse", "--verify", `${reference}^{commit}`]).trim();
}

function gitObjectExists(reference, filePath) {
  const result = spawnSync("git", ["cat-file", "-e", `${reference}:${filePath}`], {
    encoding: "utf8",
  });
  if (result.status === 0) return true;
  if (result.status === 128) return false;
  throw new Error(`Unable to inspect ${filePath} at ${reference}`);
}

function readGitObject(reference, filePath) {
  const result = spawnSync("git", ["show", `${reference}:${filePath}`], {
    encoding: null,
    maxBuffer: MAX_FILE_BYTES + 1024,
  });
  if (result.status !== 0) {
    throw new Error(`Unable to read ${filePath} at ${reference}`);
  }
  return result.stdout;
}

async function writeJsonAtomically(outputPath, value) {
  const resolved = path.resolve(ROOT, outputPath);
  if (!resolved.startsWith(`${ARTIFACTS_ROOT}${path.sep}`)) {
    throw new Error("Output must be a file below the repository artifacts/ directory");
  }
  await mkdir(path.dirname(resolved), { recursive: true });
  const temporary = `${resolved}.tmp`;
  await writeFile(temporary, `${JSON.stringify(value, null, 2)}\n`, "utf8");
  await rename(temporary, resolved);
}

async function main() {
  const options = parseArguments(process.argv.slice(2));
  if (!TARGET_PATTERN.test(options.target)) {
    throw new Error(
      "Target must be an approved lowercase alias, not an agent ID, URL, or credential",
    );
  }

  const base = verifyCommit(options.base, "base");
  const head = verifyCommit(options.head, "head");
  if (base === head) throw new Error("Base and head commits are identical");

  git(["merge-base", "--is-ancestor", base, head]);

  const rawPaths = git(
    [
      "diff",
      "--name-only",
      "-z",
      base,
      head,
      "--",
      ":(glob)docs/**/*.md",
      "CHANGELOG.md",
      "README.md",
    ],
    { encoding: "buffer" },
  );
  const changedPaths = rawPaths
    .toString("utf8")
    .split("\0")
    .filter(Boolean)
    .sort();

  const uniquePaths = [...new Set(changedPaths)];
  const changes = [];
  let totalBytes = 0;

  for (const filePath of uniquePaths) {
    const segments = filePath.split("/");
    if (
      /[\u0000-\u001f\u007f]/.test(filePath) ||
      filePath.includes("\\") ||
      path.posix.isAbsolute(filePath) ||
      segments.includes("..")
    ) {
      throw new Error(`Refusing an ambiguous knowledge path: ${JSON.stringify(filePath)}`);
    }

    if (!gitObjectExists(head, filePath)) {
      changes.push({ action: "delete", path: filePath });
      continue;
    }

    const content = readGitObject(head, filePath);
    if (content.byteLength > MAX_FILE_BYTES) {
      throw new Error(`${filePath} exceeds the ${MAX_FILE_BYTES}-byte per-file limit`);
    }
    totalBytes += content.byteLength;
    if (totalBytes > MAX_TOTAL_BYTES) {
      throw new Error(`Changed knowledge exceeds the ${MAX_TOTAL_BYTES}-byte total limit`);
    }

    changes.push({
      action: "upsert",
      path: filePath,
      bytes: content.byteLength,
      sha256: sha256(content),
    });
  }

  if (changes.length === 0) {
    throw new Error("No changed knowledge files matched the approved path filter");
  }

  const planIdentity = {
    schemaVersion: 1,
    baseCommit: base,
    headCommit: head,
    targetAlias: options.target,
    changes,
  };
  const plan = {
    ...planIdentity,
    idempotencyKey: sha256(JSON.stringify(planIdentity)),
    mode: "plan_only",
    remoteWriteAllowed: false,
    requiredBeforeLiveApply: [
      "human approval in a protected environment",
      "pinned regional raia OpenAPI contract",
      "contract-tested upload and replacement adapter",
      "upload-before-delete ordering with rollback evidence",
      "post-refresh retrieval verification",
    ],
  };

  await writeJsonAtomically(options.output, plan);
  console.log(`KNOWLEDGE_REFRESH_PLAN_OK ${changes.length} change(s)`);
  console.log(`Plan: ${path.resolve(ROOT, options.output)}`);
}

main().catch((error) => {
  console.error(`KNOWLEDGE_REFRESH_PLAN_FAILED: ${error.message}`);
  process.exitCode = 1;
});
