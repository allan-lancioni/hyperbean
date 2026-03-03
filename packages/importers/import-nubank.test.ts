import { describe, expect, it, vi } from "vitest";
import { NUBANK_TODO_MESSAGE, runImportNubank } from "./import-nubank";

describe("importers/import-nubank", () => {
  it("logs placeholder message", () => {
    const log = vi.fn();
    runImportNubank(log);

    expect(log).toHaveBeenCalledWith(NUBANK_TODO_MESSAGE);
  });
});
