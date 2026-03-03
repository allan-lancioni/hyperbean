import { describe, expect, it, vi } from "vitest";
import { findSystemPython, getVenvPythonPath, setupPython } from "./setup-python";

describe("core/setup-python", () => {
  it("resolves venv path by platform", () => {
    expect(getVenvPythonPath("win32")).toBe(".venv/Scripts/python.exe");
    expect(getVenvPythonPath("linux")).toBe(".venv/bin/python");
  });

  it("finds the first available python candidate", () => {
    const spawnSyncFn = vi
      .fn()
      .mockReturnValueOnce({ status: 1 })
      .mockReturnValueOnce({ status: 0 });

    expect(findSystemPython({ platform: "linux", spawnSyncFn: spawnSyncFn as never })).toEqual({
      command: "python",
      args: [],
    });
  });

  it("throws when python is unavailable", () => {
    const spawnSyncFn = vi.fn().mockReturnValue({ status: 1 });

    expect(() =>
      findSystemPython({
        platform: "linux",
        spawnSyncFn: spawnSyncFn as never,
      }),
    ).toThrow("Python 3 not found in PATH.");
  });

  it("runs install flow when venv already exists", () => {
    const calls: string[] = [];
    const spawnSyncFn = vi.fn((command: string, args: string[]) => {
      calls.push(`${command} ${args.join(" ")}`.trim());
      return { status: 0 };
    });

    setupPython({
      platform: "linux",
      existsSyncFn: () => true,
      spawnSyncFn: spawnSyncFn as never,
      logger: () => undefined,
    });

    expect(calls).toEqual([
      ".venv/bin/python -m pip install --upgrade pip",
      ".venv/bin/python -m pip install beancount fava",
      ".venv/bin/python -c import beancount; print(beancount.__version__)",
      ".venv/bin/python -m fava.cli --version",
    ]);
  });
});
