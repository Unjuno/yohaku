import { readFileSync } from "node:fs";

// Only local binding names are needed to build; never copy Sites project IDs to GitHub.
/** @returns {{d1?: string, r2?: string}} */
export function readHostingBindings(path = new URL("../.openai/hosting.json", import.meta.url)) {
  let source;
  try { source = readFileSync(path, "utf8"); }
  catch (error) { if (error?.code === "ENOENT") return {}; throw error; }
  const value = JSON.parse(source);
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Invalid local hosting configuration");
  /** @type {{d1?: string, r2?: string}} */
  const bindings = {};
  for (const key of ["d1", "r2"]) {
    if (value[key] === undefined || value[key] === null || value[key] === false) continue;
    if (typeof value[key] !== "string" || !value[key].trim()) throw new Error(`Invalid ${key} binding name`);
    bindings[key] = value[key];
  }
  return bindings;
}
