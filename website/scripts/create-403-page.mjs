import { copyFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const exportedPage = join(process.cwd(), "out", "403", "index.html");
const apacheErrorPage = join(process.cwd(), "out", "403.html");

if (!existsSync(exportedPage)) {
  throw new Error(`The exported 403 page was not found at ${exportedPage}`);
}

copyFileSync(exportedPage, apacheErrorPage);
