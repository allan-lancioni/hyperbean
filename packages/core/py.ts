import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { resolveLedgerPath } from "../utils/ledger-path";

export function getLocalPython(platform = process.platform): string {
  return platform === "win32"
    ? join(".venv", "Scripts", "python.exe")
    : join(".venv", "bin", "python");
}

export function buildPythonModuleArgs(tool: string, rest: string[]): string[] {
  return tool === "fava" ? ["-m", "fava.cli", ...rest] : ["-m", tool, ...rest];
}

export function resolveFavaArgs(
  argvRest: string[],
  env: NodeJS.ProcessEnv = process.env,
  cwd: string = process.cwd(),
): string[] {
  const resolved = resolveLedgerPath({
    argv: argvRest,
    env,
    cwd,
    commandName: "fava",
  });
  return [...resolved.argvWithoutLedgerPathArgs, resolved.ledgerPath];
}

type RunPyCliOptions = {
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

export function runPyCli(options: RunPyCliOptions = {}): void {
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

  const [tool, ...rest] = argv.slice(2);
  if (!tool) {
    onError("Usage: npx tsx packages/core/py.ts <tool> [args...]");
    exitFn(1);
    return;
  }

  let args: string[];
  try {
    if (tool === "fava") {
      const resolved = resolveLedgerPath({
        argv: rest,
        env,
        cwd,
        commandName: "fava",
      });
      if (resolved.warning) onWarn(resolved.warning);
      args = buildPythonModuleArgs(tool, [...resolved.argvWithoutLedgerPathArgs, resolved.ledgerPath]);
    } else {
      args = buildPythonModuleArgs(tool, rest);
    }
  } catch (error) {
    onError(error instanceof Error ? error.message : String(error));
    exitFn(1);
    return;
  }
  const child = spawnFn(localPython, args, {
    stdio: "inherit",
    shell: platform === "win32",
  });

  child.on("exit", (code, signal) => {
    if (signal) {
      onError(`Python process terminated by signal: ${signal}`);
      exitFn(1);
      return;
    }
    exitFn(code ?? 1);
  });

  child.on("error", (err) => {
    onError(`Error while running Python command: ${err.message}`);
    exitFn(1);
  });
}

const isDirectExecution =
  typeof process.argv[1] === "string" &&
  import.meta.url === pathToFileURL(process.argv[1]).href;

if (isDirectExecution) runPyCli();
