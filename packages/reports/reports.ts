import { pathToFileURL } from "node:url";

export const REPORTS_TODO_MESSAGE = "TODO: implement financial reports.";

export function runReports(log: (message: string) => void = console.log): void {
  log(REPORTS_TODO_MESSAGE);
}

const isDirectExecution =
  typeof process.argv[1] === "string" &&
  import.meta.url === pathToFileURL(process.argv[1]).href;

if (isDirectExecution) runReports();
