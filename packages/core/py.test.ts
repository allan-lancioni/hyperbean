import { describe, expect, it, vi } from "vitest";
import { buildPythonModuleArgs, getLocalPython, resolveFavaArgs, runPyCli } from "./py";

describe("core/py", () => {
  it("builds fava args", () => {
    expect(buildPythonModuleArgs("fava", ["--port", "5000"]))
      .toEqual(["-m", "fava.cli", "--port", "5000"]);
  });

  it("builds generic module args", () => {
    expect(buildPythonModuleArgs("beancount.scripts.check", ["ledger.bean"]))
      .toEqual(["-m", "beancount.scripts.check", "ledger.bean"]);
  });

  it("resolves fava args from --ledge-path and strips flag", () => {
    expect(resolveFavaArgs(["--port", "5000", "--ledge-path", "custom.bean"], {}, "/tmp"))
      .toEqual(["--port", "5000", "custom.bean"]);
  });

  it("resolves fava args from npm config environment", () => {
    expect(resolveFavaArgs(["--port", "5000"], { npm_config_ledge_path: "npm.bean" }, "/tmp"))
      .toEqual(["--port", "5000", "npm.bean"]);
  });

  it("resolves local python path by platform", () => {
    expect(getLocalPython("win32")).toBe(".venv/Scripts/python.exe");
    expect(getLocalPython("linux")).toBe(".venv/bin/python");
  });

  it("fails when tool is not provided", () => {
    const onError = vi.fn();
    const exitFn = vi.fn((code: number): never => {
      throw new Error(`EXIT:${code}`);
    });

    expect(() =>
      runPyCli({
        argv: ["node", "py.ts"],
        existsSyncFn: () => true,
        onError,
        exitFn,
      }),
    ).toThrow("EXIT:1");

    expect(onError).toHaveBeenCalledWith("Usage: npx tsx packages/core/py.ts <tool> [args...]");
  });

  it("fails when fava --ledge-path is missing value", () => {
    const onError = vi.fn();
    const exitFn = vi.fn((code: number): never => {
      throw new Error(`EXIT:${code}`);
    });

    expect(() =>
      runPyCli({
        argv: ["node", "py.ts", "fava", "--ledge-path"],
        existsSyncFn: () => true,
        onError,
        exitFn,
      }),
    ).toThrow("EXIT:1");

    expect(onError).toHaveBeenCalledWith(
      "Usage: npm run fava -- --ledge-path /path/to/main.bean (or -l /path/to/main.bean)",
    );
  });

  it("warns and uses first ledger when fava path is not provided", () => {
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
      runPyCli({
        argv: ["node", "py.ts", "fava", "--host", "127.0.0.1"],
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
