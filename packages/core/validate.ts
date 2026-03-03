import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { resolveLedgerPath as resolveSharedLedgerPath } from "../utils/ledger-path";

type RunValidateOptions = {
  argv?: string[];
  env?: NodeJS.ProcessEnv;
  cwd?: string;
  platform?: NodeJS.Platform;
  existsSyncFn?: (path: string) => boolean;
  spawnFn?: typeof spawn;
  onError?: (message: string) => void;
  onWarn?: (message: string) => void;
  exitFn?: (code: number) => never;
};

export function getLocalPython(platform = process.platform): string {
  return platform === "win32"
    ? join(".venv", "Scripts", "python.exe")
    : join(".venv", "bin", "python");
}

export function resolveLedgerPath(
  argv: string[] = process.argv,
  env: NodeJS.ProcessEnv = process.env,
  cwd: string = process.cwd(),
): string {
  return resolveSharedLedgerPath({
    argv,
    env,
    cwd,
    commandName: "validate",
  }).ledgerPath;
}

export function buildValidateArgs(ledgerPath: string): string[] {
  return ["-m", "beancount.scripts.check", ledgerPath];
}

export function runValidate(options: RunValidateOptions = {}): void {
  const argv = options.argv ?? process.argv;
  const env = options.env ?? process.env;
  const cwd = options.cwd ?? process.cwd();
  const platform = options.platform ?? process.platform;
  const existsSyncFn = options.existsSyncFn ?? existsSync;
  const spawnFn = options.spawnFn ?? spawn;
  const onError = options.onError ?? console.error;
  const onWarn = options.onWarn ?? console.warn;
  const exitFn = options.exitFn ?? ((code: number) => process.exit(code));

  const localPython = getLocalPython(platform);
  if (!existsSyncFn(localPython)) {
    onError('Local Python not found in ".venv". Run: npm run setup');
    exitFn(1);
    return;
  }

  let ledgerPath: string;
  try {
    const resolvedLedger = resolveSharedLedgerPath({
      argv,
      env,
      cwd,
      commandName: "validate",
    });
    ledgerPath = resolvedLedger.ledgerPath;
    if (resolvedLedger.warning) onWarn(resolvedLedger.warning);
  } catch (error) {
    onError(error instanceof Error ? error.message : String(error));
    exitFn(1);
    return;
  }

  const child = spawnFn(localPython, buildValidateArgs(ledgerPath), {
    stdio: "inherit",
    shell: platform === "win32",
  });

  child.on("exit", (code, signal) => {
    if (signal) {
      onError(`bean-check terminated by signal: ${signal}`);
      exitFn(1);
      return;
    }
    exitFn(code ?? 1);
  });

  child.on("error", (err) => {
    onError(`Error while running bean-check: ${err.message}`);
    exitFn(1);
  });
}

const isDirectExecution =
  typeof process.argv[1] === "string" &&
  import.meta.url === pathToFileURL(process.argv[1]).href;

if (isDirectExecution) runValidate();
