import { describe, expect, it, vi } from "vitest";
import { buildValidateArgs, resolveLedgerPath, runValidate } from "./validate";

describe("core/validate", () => {
  it("resolves ledger path from --ledge-path", () => {
    expect(resolveLedgerPath(["node", "validate.ts", "--ledge-path", "custom.bean"], {}))
      .toBe("custom.bean");
  });

  it("resolves ledger path from -l", () => {
    expect(resolveLedgerPath(["node", "validate.ts", "-l", "custom.bean"], {}))
      .toBe("custom.bean");
  });

  it("resolves ledger path from environment key", () => {
    expect(resolveLedgerPath(["node", "validate.ts"], { FINANCE_LEDGER_PATH: "env.bean" }, "/tmp"))
      .toBe("env.bean");
  });

  it("resolves ledger path from npm_config_ledge_path", () => {
    expect(resolveLedgerPath(["node", "validate.ts"], { npm_config_ledge_path: "npm.bean" }, "/tmp"))
      .toBe("npm.bean");
  });

  it("builds validate args", () => {
    expect(buildValidateArgs("ledger/main.bean"))
      .toEqual(["-m", "beancount.scripts.check", "ledger/main.bean"]);
  });

  it("fails when --ledge-path is missing value", () => {
    const onError = vi.fn();
    const exitFn = vi.fn((code: number): never => {
      throw new Error(`EXIT:${code}`);
    });

    expect(() =>
      runValidate({
        argv: ["node", "validate.ts", "--ledge-path"],
        existsSyncFn: () => true,
        onError,
        exitFn,
      }),
    ).toThrow("EXIT:1");

    expect(onError).toHaveBeenCalledWith(
      "Usage: npm run validate -- --ledge-path /path/to/main.bean (or -l /path/to/main.bean)",
    );
  });

  it("warns and uses first detected ledger when no path is provided", () => {
    const onWarn = vi.fn();
    const spawnFn = vi.fn(() => {
      return {
        on: (event: "exit" | "error", cb: (code?: number) => void) => {
          if (event === "exit") cb(0);
        },
      };
    }) as unknown as typeof import("node:child_process").spawn;
    const exitFn = vi.fn((code: number): never => {
      throw new Error(`EXIT:${code}`);
    });

    expect(() =>
      runValidate({
        argv: ["node", "validate.ts"],
        cwd: process.cwd(),
        existsSyncFn: () => true,
        spawnFn,
        onWarn,
        exitFn,
      }),
    ).toThrow("EXIT:0");

    expect(onWarn).toHaveBeenCalledOnce();
  });
});
