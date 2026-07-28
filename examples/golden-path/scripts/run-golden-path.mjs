import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  copyFile,
  mkdir,
  readFile,
  rename,
  stat,
  writeFile,
} from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ARTIFACTS = path.join(ROOT, "artifacts");
const MOCK_STORE = path.join(ARTIFACTS, "mock-agent-store");
const SOURCE_DOCUMENT = "docs/order-status.md";
const DESTINATION_DOCUMENT = path.join(MOCK_STORE, "order-status.md");
const DESTINATION_ID = "local-mock://support-docs-agent/order-status.md";
const REQUIRED_CRITERIA = ["AC-1", "AC-2", "AC-3", "AC-4", "AC-5"];
const ALLOWED_ARGUMENTS = new Set(["--apply-mock-sync"]);

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function projectPath(relativePath) {
  const resolved = path.resolve(ROOT, relativePath);
  if (resolved !== ROOT && !resolved.startsWith(`${ROOT}${path.sep}`)) {
    throw new Error(`Path escapes the example root: ${relativePath}`);
  }
  return resolved;
}

async function readText(relativePath) {
  return readFile(projectPath(relativePath), "utf8");
}

async function readJson(relativePath) {
  const text = await readText(relativePath);
  try {
    return JSON.parse(text);
  } catch (error) {
    throw new Error(`Invalid JSON in ${relativePath}: ${error.message}`);
  }
}

async function hashFile(relativePath) {
  return sha256(await readFile(projectPath(relativePath)));
}

async function exists(filePath) {
  try {
    await stat(filePath);
    return true;
  } catch (error) {
    if (error.code === "ENOENT") return false;
    throw error;
  }
}

async function atomicJson(filePath, value) {
  const resolved = path.resolve(filePath);
  if (!resolved.startsWith(`${ARTIFACTS}${path.sep}`)) {
    throw new Error(`Refusing to write outside artifacts/: ${resolved}`);
  }
  await mkdir(path.dirname(resolved), { recursive: true });
  const temporary = `${resolved}.tmp`;
  await writeFile(temporary, `${JSON.stringify(value, null, 2)}\n`, "utf8");
  await rename(temporary, resolved);
}

async function atomicText(filePath, value) {
  const resolved = path.resolve(filePath);
  if (!resolved.startsWith(`${ARTIFACTS}${path.sep}`)) {
    throw new Error(`Refusing to write outside artifacts/: ${resolved}`);
  }
  await mkdir(path.dirname(resolved), { recursive: true });
  const temporary = `${resolved}.tmp`;
  await writeFile(temporary, value, "utf8");
  await rename(temporary, resolved);
}

function validateArguments() {
  const argumentsProvided = process.argv.slice(2);
  const unknown = argumentsProvided.filter((value) => !ALLOWED_ARGUMENTS.has(value));
  if (unknown.length > 0 || argumentsProvided.length > 1) {
    throw new Error(`Unsupported arguments: ${argumentsProvided.join(" ") || "none"}`);
  }
  return argumentsProvided.includes("--apply-mock-sync");
}

function runBehaviorTests() {
  const result = spawnSync(
    process.execPath,
    ["--test", "test/order-status.test.mjs"],
    { cwd: ROOT, encoding: "utf8", env: { ...process.env, NO_COLOR: "1" } },
  );

  if (result.status !== 0) {
    process.stdout.write(result.stdout ?? "");
    process.stderr.write(result.stderr ?? "");
    throw new Error("Behavior tests failed");
  }

  return {
    command: "node --test test/order-status.test.mjs",
    status: "pass",
    acceptanceCriteria: REQUIRED_CRITERIA,
  };
}

async function validateEvidenceChain() {
  const review = await readJson("review/spec-review.json");
  if (review.status !== "approved_for_local_reference_example") {
    throw new Error("The review record is not approved for the local reference example");
  }

  const reviewedEntries = Object.entries(review.reviewedArtifacts ?? {});
  if (reviewedEntries.length === 0) {
    throw new Error("The review record does not bind any artifacts");
  }

  for (const [relativePath, expectedHash] of reviewedEntries) {
    const actualHash = await hashFile(relativePath);
    if (actualHash !== expectedHash) {
      throw new Error(
        `Reviewed artifact changed: ${relativePath}; expected ${expectedHash}, received ${actualHash}`,
      );
    }
  }

  const criteria = new Map((review.criteria ?? []).map((item) => [item.id, item]));
  for (const criterion of REQUIRED_CRITERIA) {
    if (criteria.get(criterion)?.result !== "pass") {
      throw new Error(`Acceptance criterion is not approved: ${criterion}`);
    }
  }

  const specification = await readText("specs/order-status.md");
  const tests = await readText("test/order-status.test.mjs");
  for (const criterion of REQUIRED_CRITERIA) {
    if (!specification.includes(`**${criterion}**`)) {
      throw new Error(`Specification is missing ${criterion}`);
    }
    if (!tests.includes(`${criterion}:`)) {
      throw new Error(`Tests are missing ${criterion}`);
    }
  }

  const plan = await readText("plans/order-status-plan.md");
  for (const requiredReference of [
    "fixtures/product-agent-context.json",
    "fixtures/codebase-agent-context.json",
    "specs/order-status.md",
  ]) {
    if (!plan.includes(requiredReference)) {
      throw new Error(`Implementation plan does not cite ${requiredReference}`);
    }
  }

  const productContext = await readJson("fixtures/product-agent-context.json");
  const codebaseContext = await readJson("fixtures/codebase-agent-context.json");
  if (productContext.mode !== "offline_fixture" || codebaseContext.mode !== "offline_fixture") {
    throw new Error("Agent context must remain offline fixtures in this example");
  }

  const credentialPatterns = [
    /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,
    /\b(?:api[_-]?key|secret|token)\s*[:=]\s*["'][A-Za-z0-9_./+-]{12,}["']/i,
    /\b(?:sk|rk|pk)_[A-Za-z0-9]{20,}\b/,
    /\bgh[opsu]_[A-Za-z0-9]{20,}\b/,
  ];

  for (const [relativePath] of reviewedEntries) {
    const content = await readText(relativePath);
    for (const pattern of credentialPatterns) {
      if (pattern.test(content)) {
        throw new Error(`Possible credential found in reviewed artifact: ${relativePath}`);
      }
    }
  }

  return {
    reviewId: review.reviewId,
    reviewStatus: review.status,
    reviewedArtifactCount: reviewedEntries.length,
    acceptanceCriteria: REQUIRED_CRITERIA,
    unresolvedProductionGaps: review.specGaps ?? [],
  };
}

async function createPreview(evidence, testResult) {
  const sourceHash = await hashFile(SOURCE_DOCUMENT);
  const preview = {
    schemaVersion: 1,
    operation: "knowledge_sync_preview",
    mode: "dry_run",
    source: {
      path: SOURCE_DOCUMENT,
      sha256: sourceHash,
    },
    destination: {
      id: DESTINATION_ID,
      kind: "local_mock_agent_store",
    },
    idempotencyKey: sha256(`golden-path:${sourceHash}:${DESTINATION_ID}`),
    evidence,
    tests: testResult,
    writeAllowed: false,
    liveNetworkAllowed: false,
  };

  await atomicJson(path.join(ARTIFACTS, "sync-preview.json"), preview);
  return preview;
}

async function applyToMockStore(preview) {
  await mkdir(MOCK_STORE, { recursive: true });

  const priorHash = (await exists(DESTINATION_DOCUMENT))
    ? sha256(await readFile(DESTINATION_DOCUMENT))
    : null;

  await copyFile(projectPath(SOURCE_DOCUMENT), DESTINATION_DOCUMENT);
  const appliedHash = sha256(await readFile(DESTINATION_DOCUMENT));
  if (appliedHash !== preview.source.sha256) {
    throw new Error("The local mock destination does not match the approved source hash");
  }

  const index = {
    schemaVersion: 1,
    agent: "support-docs-agent",
    mode: "local_mock_only",
    documents: [
      {
        destination: DESTINATION_ID,
        sourcePath: SOURCE_DOCUMENT,
        sha256: appliedHash,
      },
    ],
  };
  await atomicJson(path.join(MOCK_STORE, "index.json"), index);

  const receipt = {
    schemaVersion: 1,
    operation: priorHash === appliedHash ? "no_change" : "local_mock_sync",
    mode: "local_mock_only",
    idempotencyKey: preview.idempotencyKey,
    destination: DESTINATION_ID,
    previousSha256: priorHash,
    appliedSha256: appliedHash,
    reviewId: preview.evidence.reviewId,
    liveNetworkUsed: false,
  };
  await atomicJson(path.join(ARTIFACTS, "sync-receipt.json"), receipt);
  return receipt;
}

async function verifyFreshness(receipt) {
  const questions = await readJson("fixtures/freshness-questions.json");
  const indexedContent = await readFile(DESTINATION_DOCUMENT, "utf8");
  const normalized = indexedContent.toLowerCase();

  const results = questions.questions.map((question) => {
    const missing = question.requiredPhrases.filter(
      (phrase) => !normalized.includes(phrase.toLowerCase()),
    );
    return {
      id: question.id,
      question: question.question,
      requiredPhrases: question.requiredPhrases,
      source: DESTINATION_ID,
      sourceSha256: receipt.appliedSha256,
      result: missing.length === 0 ? "pass" : "fail",
      missingPhrases: missing,
    };
  });

  if (results.some((result) => result.result !== "pass")) {
    throw new Error("At least one post-refresh freshness question failed");
  }
  return results;
}

async function writePilotEvidence(preview, receipt, freshness) {
  const evidence = {
    schemaVersion: 1,
    pilot: "order-status-golden-path",
    mode: "local_mock_only",
    stages: {
      ground: { status: "pass", artifact: "evidence/customer-pattern.md" },
      specify: { status: "pass", artifact: "specs/order-status.md" },
      plan: { status: "pass", artifact: "plans/order-status-plan.md" },
      build: {
        status: "pass",
        artifacts: [
          "src/order-status.mjs",
          "test/order-status.test.mjs",
          "docs/order-status.md",
        ],
      },
      review: { status: "pass", artifact: "review/spec-review.json" },
      refresh: {
        status: "pass",
        preview: "artifacts/sync-preview.json",
        receipt: "artifacts/sync-receipt.json",
        operation: receipt.operation,
      },
      verify: { status: "pass", questions: freshness },
    },
    sourceSha256: preview.source.sha256,
    destinationSha256: receipt.appliedSha256,
    liveNetworkUsed: false,
    productionApproved: false,
  };

  await atomicJson(path.join(ARTIFACTS, "pilot-evidence.json"), evidence);

  const summary = `# Golden-path pilot summary\n\n| Stage | Result | Evidence |\n|---|---|---|\n| Ground | Pass | \`evidence/customer-pattern.md\` |\n| Specify | Pass | \`specs/order-status.md\` |\n| Plan | Pass | \`plans/order-status-plan.md\` |\n| Build | Pass | Source, tests, and documentation |\n| Review | Pass | \`review/spec-review.json\` |\n| Refresh | Pass | Local mock receipt; operation \`${receipt.operation}\` |\n| Verify | Pass | ${freshness.length} representative freshness questions |\n\n> This result proves only the local reference loop. It does not approve a live raia write, application merge, agent release, or production action.\n`;
  await atomicText(path.join(ARTIFACTS, "pilot-summary.md"), summary);
}

async function main() {
  const applyMockSync = validateArguments();
  const evidence = await validateEvidenceChain();
  const testResult = runBehaviorTests();
  const preview = await createPreview(evidence, testResult);

  if (!applyMockSync) {
    console.log("GOLDEN_PATH_DRY_RUN_OK");
    console.log(`Preview: ${path.relative(ROOT, path.join(ARTIFACTS, "sync-preview.json"))}`);
    return;
  }

  const receipt = await applyToMockStore(preview);
  const freshness = await verifyFreshness(receipt);
  await writePilotEvidence(preview, receipt, freshness);

  console.log("GOLDEN_PATH_COMPLETE");
  console.log(`Receipt: ${path.relative(ROOT, path.join(ARTIFACTS, "sync-receipt.json"))}`);
  console.log(`Evidence: ${path.relative(ROOT, path.join(ARTIFACTS, "pilot-evidence.json"))}`);
}

main().catch((error) => {
  console.error(`GOLDEN_PATH_FAILED: ${error.message}`);
  process.exitCode = 1;
});
