import { describe, expect, it, vi } from "vitest";
import { REPORTS_TODO_MESSAGE, runReports } from "./reports";

describe("reports/reports", () => {
  it("logs placeholder message", () => {
    const log = vi.fn();
    runReports(log);

    expect(log).toHaveBeenCalledWith(REPORTS_TODO_MESSAGE);
  });
});
