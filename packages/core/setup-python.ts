import { existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

export type Cmd = {
  command: string;
  args: string[];
};

type SpawnSyncFn = typeof spawnSync;

type SetupPythonOptions = {
  platform?: NodeJS.Platform;
  existsSyncFn?: (path: string) => boolean;
  spawnSyncFn?: SpawnSyncFn;
  logger?: (message: string) => void;
};

export function run(command: string, args: string[], options: SetupPythonOptions = {}) {
  const spawnSyncFn = options.spawnSyncFn ?? spawnSync;
  const logger = options.logger ?? console.log;
  const platform = options.platform ?? process.platform;
  const printable = `${command} ${args.join(" ")}`.trim();
  logger(`> ${printable}`);

  const result = spawnSyncFn(command, args, {
    stdio: "inherit",
    shell: platform === "win32",
  });

  if (result.error) {
    throw new Error(`Failed to run "${printable}": ${result.error.message}`);
  }

  if (typeof result.status === "number" && result.status !== 0) {
    throw new Error(`Command failed with status ${result.status}: "${printable}"`);
  }
}

export function findSystemPython(options: SetupPythonOptions = {}): Cmd {
  const spawnSyncFn = options.spawnSyncFn ?? spawnSync;
  const platform = options.platform ?? process.platform;
  const candidates: Cmd[] =
    platform === "win32"
      ? [
          { command: "py", args: ["-3"] },
          { command: "python", args: [] },
          { command: "python3", args: [] },
        ]
      : [
          { command: "python3", args: [] },
          { command: "python", args: [] },
        ];

  for (const candidate of candidates) {
    const probe = spawnSyncFn(candidate.command, [...candidate.args, "--version"], {
      stdio: "ignore",
      shell: platform === "win32",
    });
    if (probe.status === 0) return candidate;
  }

  throw new Error("Python 3 not found in PATH.");
}

export function getVenvPythonPath(platform = process.platform, venvDir = ".venv"): string {
  return platform === "win32"
    ? join(venvDir, "Scripts", "python.exe")
    : join(venvDir, "bin", "python");
}

export function setupPython(options: SetupPythonOptions = {}): void {
  const platform = options.platform ?? process.platform;
  const existsSyncFn = options.existsSyncFn ?? existsSync;
  const logger = options.logger ?? console.log;
  const venvDir = ".venv";
  const venvPython = getVenvPythonPath(platform, venvDir);

  if (!existsSyncFn(venvPython)) {
    const systemPython = findSystemPython(options);
    run(systemPython.command, [...systemPython.args, "-m", "venv", venvDir], options);
  } else {
    logger(`> Reusing existing virtual environment at ${venvDir}`);
  }

  run(venvPython, ["-m", "pip", "install", "--upgrade", "pip"], options);
  run(venvPython, ["-m", "pip", "install", "beancount", "fava"], options);

  run(venvPython, ["-c", "import beancount; print(beancount.__version__)"], options);
  run(venvPython, ["-m", "fava.cli", "--version"], options);

  logger("");
  logger("Python environment ready.");
}

const isDirectExecution =
  typeof process.argv[1] === "string" &&
  import.meta.url === pathToFileURL(process.argv[1]).href;

if (isDirectExecution) setupPython();
