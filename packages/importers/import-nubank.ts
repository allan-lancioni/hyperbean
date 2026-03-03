import { pathToFileURL } from "node:url";

/**
 * TODO: implement Nubank importer.
 *
 * Expected format in imports/raw:
 * - Original CSV files exported by Nubank (card and/or account),
 *   with no manual edits.
 * - Recommended naming with date and type, e.g.:
 *   2026-01_nubank_card.csv
 *   2026-01_nubank_account.csv
 */

export const NUBANK_TODO_MESSAGE = "TODO: implement Nubank import.";

export function runImportNubank(log: (message: string) => void = console.log): void {
  log(NUBANK_TODO_MESSAGE);
}

const isDirectExecution =
  typeof process.argv[1] === "string" &&
  import.meta.url === pathToFileURL(process.argv[1]).href;

if (isDirectExecution) runImportNubank();
