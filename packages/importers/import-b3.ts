import { pathToFileURL } from "node:url";

/**
 * TODO: implement B3 importer.
 *
 * Expected format in imports/raw:
 * - CSV/XLSX files for trades, earnings, and position,
 *   exported from B3/broker with no manual edits.
 * - Recommended naming with date and origin, e.g.:
 *   2026-01_b3_trades.csv
 *   2026-01_b3_earnings.csv
 */

export const B3_TODO_MESSAGE = "TODO: implement B3 import.";

export function runImportB3(log: (message: string) => void = console.log): void {
  log(B3_TODO_MESSAGE);
}

const isDirectExecution =
  typeof process.argv[1] === "string" &&
  import.meta.url === pathToFileURL(process.argv[1]).href;

if (isDirectExecution) runImportB3();
