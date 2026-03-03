import { existsSync, readdirSync } from "node:fs";
import { join, relative, sep } from "node:path";

const LEDGER_FLAGS = ["--ledger", "--ledger-path", "--ledge-path", "-l"];
const ENV_LEDGER_KEYS = [
  "FINANCE_LEDGER_PATH",
  "npm_config_ledger",
  "npm_config_ledger_path",
  "npm_config_ledge_path",
  "npm_config_l",
] as const;

export type ResolveLedgerPathOptions = {
  argv?: string[];
  env?: NodeJS.ProcessEnv;
  cwd?: string;
  commandName: string;
  existsSyncFn?: (path: string) => boolean;
  readdirSyncFn?: typeof readdirSync;
};

export type ResolvedLedgerPath = {
  ledgerPath: string;
  argvWithoutLedgerPathArgs: string[];
  warning?: string;
};

function parseLedgerPathArg(argv: string[]): { ledgerPath?: string; argvWithoutLedgerPathArgs: string[] } {
  const cleaned: string[] = [];
  let ledgerPath: string | undefined;

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];

    if (LEDGER_FLAGS.includes(token)) {
      const value = argv[i + 1];
      if (!value) {
        throw new Error("Missing value for ledger path flag.");
      }
      ledgerPath = value;
      i += 1;
      continue;
    }

    const alias = LEDGER_FLAGS.find((flag) => token.startsWith(`${flag}=`));
    if (alias) {
      const value = token.slice(alias.length + 1);
      if (!value) {
        throw new Error("Missing value for ledger path flag.");
      }
      ledgerPath = value;
      continue;
    }

    cleaned.push(token);
  }

  return { ledgerPath, argvWithoutLedgerPathArgs: cleaned };
}

function collectBeanFiles(
  root: string,
  existsSyncFn: (path: string) => boolean,
  readdirSyncFn: typeof readdirSync,
): string[] {
  if (!existsSyncFn(root)) return [];

  const beanFiles: string[] = [];
  const stack = [root];

  while (stack.length > 0) {
    const current = stack.pop();
    if (!current) continue;

    const entries = readdirSyncFn(current, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = join(current, entry.name);
      if (entry.isDirectory()) {
        stack.push(fullPath);
        continue;
      }
      if (entry.isFile() && entry.name.endsWith(".bean")) {
        const rel = relative(root, fullPath);
        const segments = rel.split(sep);
        if (segments.some((segment) => segment.toLowerCase().includes("ledger"))) {
          beanFiles.push(fullPath);
        }
      }
    }
  }

  return beanFiles;
}

function findFirstLedgerPath(
  cwd: string,
  existsSyncFn: (path: string) => boolean,
  readdirSyncFn: typeof readdirSync,
): string | undefined {
  const candidates = ["ledger", "ledgers", "examples"]
    .map((folder) => join(cwd, folder))
    .flatMap((folder) => collectBeanFiles(folder, existsSyncFn, readdirSyncFn))
    .sort((a, b) => a.localeCompare(b));

  const mainCandidate = candidates.find((path) => path.endsWith(`${sep}main.bean`));
  return mainCandidate ?? candidates[0];
}

export function resolveLedgerPath(options: ResolveLedgerPathOptions): ResolvedLedgerPath {
  const argv = options.argv ?? process.argv;
  const env = options.env ?? process.env;
  const cwd = options.cwd ?? process.cwd();
  const existsSyncFn = options.existsSyncFn ?? existsSync;
  const readdirSyncFn = options.readdirSyncFn ?? readdirSync;

  let parsed;
  try {
    parsed = parseLedgerPathArg(argv);
  } catch {
    throw new Error(
      `Usage: npm run ${options.commandName} -- --ledge-path /path/to/main.bean (or -l /path/to/main.bean)`,
    );
  }

  const envLedgerPath = ENV_LEDGER_KEYS
    .map((key) => env[key])
    .find((value): value is string => typeof value === "string" && value.length > 0);

  if (parsed.ledgerPath) {
    return { ledgerPath: parsed.ledgerPath, argvWithoutLedgerPathArgs: parsed.argvWithoutLedgerPathArgs };
  }

  if (envLedgerPath) {
    return { ledgerPath: envLedgerPath, argvWithoutLedgerPathArgs: parsed.argvWithoutLedgerPathArgs };
  }

  const firstLedgerPath = findFirstLedgerPath(cwd, existsSyncFn, readdirSyncFn);
  if (!firstLedgerPath) {
    throw new Error(
      `No ledger file found in ledger folders. Pass one with --ledge-path or -l.`,
    );
  }

  return {
    ledgerPath: firstLedgerPath,
    argvWithoutLedgerPathArgs: parsed.argvWithoutLedgerPathArgs,
    warning: `Warning: no ledger path provided; using first detected ledger: ${firstLedgerPath}`,
  };
}
