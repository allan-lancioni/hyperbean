import { describe, expect, it, vi } from "vitest";
import { B3_TODO_MESSAGE, runImportB3 } from "./import-b3";

describe("importers/import-b3", () => {
  it("logs placeholder message", () => {
    const log = vi.fn();
    runImportB3(log);

    expect(log).toHaveBeenCalledWith(B3_TODO_MESSAGE);
  });
});
