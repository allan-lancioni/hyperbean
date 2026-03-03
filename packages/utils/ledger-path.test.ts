import { mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { resolveLedgerPath } from "./ledger-path";

describe("utils/ledger-path", () => {
  it("resolves path from --ledge-path", () => {
    const resolved = resolveLedgerPath({
      argv: ["--ledge-path", "custom.bean"],
      env: {},
      cwd: "/tmp",
      commandName: "validate",
    });
    expect(resolved.ledgerPath).toBe("custom.bean");
    expect(resolved.argvWithoutLedgerPathArgs).toEqual([]);
  });

  it("resolves path from -l", () => {
    const resolved = resolveLedgerPath({
      argv: ["-l", "custom.bean"],
      env: {},
      cwd: "/tmp",
      commandName: "validate",
    });
    expect(resolved.ledgerPath).toBe("custom.bean");
  });

  it("resolves path from npm_config_ledger_path", () => {
    const resolved = resolveLedgerPath({
      argv: [],
      env: { npm_config_ledger_path: "env.bean" },
      cwd: "/tmp",
      commandName: "validate",
    });
    expect(resolved.ledgerPath).toBe("env.bean");
  });

  it("uses first ledger in ledger folders and emits warning", () => {
    const cwd = mkdtempSync(join(tmpdir(), "ledger-path-test-"));
    mkdirSync(join(cwd, "examples", "a-ledger"), { recursive: true });
    mkdirSync(join(cwd, "examples", "b-ledger"), { recursive: true });
    writeFileSync(join(cwd, "examples", "b-ledger", "main.bean"), "option \"title\" \"b\"\n");
    writeFileSync(join(cwd, "examples", "a-ledger", "main.bean"), "option \"title\" \"a\"\n");

    const resolved = resolveLedgerPath({
      argv: [],
      env: {},
      cwd,
      commandName: "validate",
    });

    expect(resolved.ledgerPath).toBe(join(cwd, "examples", "a-ledger", "main.bean"));
    expect(resolved.warning).toContain("Warning:");
  });

  it("fails when flag value is missing", () => {
    expect(() =>
      resolveLedgerPath({
        argv: ["--ledge-path"],
        env: {},
        cwd: "/tmp",
        commandName: "fava",
      }),
    ).toThrow("Usage: npm run fava -- --ledge-path /path/to/main.bean (or -l /path/to/main.bean)");
  });
});
