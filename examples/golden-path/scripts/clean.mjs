import { rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const artifacts = path.resolve(root, "artifacts");

if (artifacts !== path.join(root, "artifacts")) {
  throw new Error("Refusing to clean an unexpected path");
}

await rm(artifacts, { recursive: true, force: true });
console.log("GOLDEN_PATH_CLEAN");
