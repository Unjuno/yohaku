import { execFileSync } from "node:child_process";

const paths = execFileSync("git", ["ls-files", "-z"], { encoding: "utf8" }).split("\0").filter(Boolean);
const forbidden = paths.filter((path) =>
  path === ".openai/hosting.json" || /(^|\/)\.env(?:\.|$)/.test(path) || /\.pem$/i.test(path) ||
  /^(?:\.sites-runtime|\.agents|\.codex|outputs|work|node_modules|dist|\.wrangler)\//.test(path));
if (forbidden.length) {
  console.error("Remove checkout-local files from the sync/commit:\n" + forbidden.join("\n"));
  process.exitCode = 1;
} else {
  console.log(`Sync path check passed (${paths.length} tracked paths). Not a full secret scan.`);
}
