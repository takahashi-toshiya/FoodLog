const { createHash } = require("node:crypto");
const { existsSync, readFileSync, writeFileSync } = require("node:fs");
const { join } = require("node:path");
const { execFileSync } = require("node:child_process");

const SOURCE_PATHS = ["src", "tests"];
const CHECKS = [
  ["format", ["run", "format"]],
  ["lint", ["run", "lint"]],
  ["typecheck", ["run", "typecheck"]],
  ["test", ["test"]],
];
const OUTPUT_LIMIT = 6000;

function output(value) {
  process.stdout.write(JSON.stringify(value));
}

function run(command, args, cwd) {
  return execFileSync(command, args, {
    cwd,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
}

function readHookInput() {
  try {
    return JSON.parse(readFileSync(0, "utf8"));
  } catch {
    return {};
  }
}

function getRepositoryRoot(cwd) {
  return run("git", ["rev-parse", "--show-toplevel"], cwd).trim();
}

function getSourceStatus(repositoryRoot) {
  return run(
    "git",
    ["status", "--porcelain", "--untracked-files=all", "--", ...SOURCE_PATHS],
    repositoryRoot,
  ).trim();
}

function getSourceFingerprint(repositoryRoot) {
  const files = run(
    "git",
    ["ls-files", "--cached", "--others", "--exclude-standard", "--", ...SOURCE_PATHS],
    repositoryRoot,
  )
    .split("\n")
    .filter(Boolean)
    .sort();
  const hash = createHash("sha256");

  for (const file of files) {
    hash.update(file);
    hash.update("\0");
    const absolutePath = join(repositoryRoot, file);
    hash.update(existsSync(absolutePath) ? readFileSync(absolutePath) : "<deleted>");
    hash.update("\0");
  }

  return hash.digest("hex");
}

function getFailureOutput(error) {
  const stdout = typeof error.stdout === "string" ? error.stdout : "";
  const stderr = typeof error.stderr === "string" ? error.stderr : "";
  return `${stdout}${stderr}`.slice(-OUTPUT_LIMIT).trim();
}

function main() {
  const hookInput = readHookInput();
  const repositoryRoot = getRepositoryRoot(hookInput.cwd || process.cwd());
  const statePath = join(repositoryRoot, ".codex-quality-check-state");

  if (!getSourceStatus(repositoryRoot)) {
    output({});
    return;
  }

  const fingerprintBeforeChecks = getSourceFingerprint(repositoryRoot);
  let previousFingerprint = "";

  try {
    previousFingerprint = readFileSync(statePath, "utf8").trim();
  } catch {
    // The first changed source state has not been checked yet.
  }

  if (fingerprintBeforeChecks === previousFingerprint) {
    output({});
    return;
  }

  for (const [, args] of CHECKS) {
    try {
      run("npm", args, repositoryRoot);
    } catch (error) {
      const details = getFailureOutput(error);
      const reason = [
        `Quality check failed at npm ${args.join(" ")}.`,
        details,
        "Fix the failure, then run format, lint, typecheck, and test in that order.",
      ]
        .filter(Boolean)
        .join("\n\n");

      if (!hookInput.stop_hook_active) {
        output({ decision: "block", reason });
      } else {
        output({
          systemMessage:
            `${reason}\n\nAutomatic continuation was already used once, so the Stop hook will not continue again. Report any remaining failure to the user.`,
        });
      }
      return;
    }
  }

  writeFileSync(statePath, `${getSourceFingerprint(repositoryRoot)}\n`);
  output({});
}

try {
  main();
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  output({
    systemMessage: `FoodLog quality hook could not run: ${message}`,
  });
}
