import ts from "typescript";
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";

// Execute compiled repository modules, not a hand-copied version of their logic.
export function compileSources(root, paths) {
  const output = mkdtempSync(path.join(tmpdir(), "yohaku-source-test-"));
  writeFileSync(path.join(output, "package.json"), '{"type":"module"}');
  for (const sourcePath of paths) {
    const targetPath = path.join(output, sourcePath.replace(/\.ts$/, ".js"));
    const { outputText } = ts.transpileModule(readFileSync(path.join(root, sourcePath), "utf8"), {
      compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 },
      fileName: sourcePath,
    });
    const resolved = outputText.replace(/from (["'])([^"']+)\1/g, (all, quote, specifier) => {
      if (specifier.startsWith("@/")) {
        let relative = path.relative(path.dirname(targetPath), path.join(output, specifier.slice(2) + ".js")).split(path.sep).join("/");
        if (!relative.startsWith(".")) relative = "./" + relative;
        return `from ${quote}${relative}${quote}`;
      }
      if (specifier.startsWith(".") && !path.extname(specifier)) return `from ${quote}${specifier}.js${quote}`;
      return all;
    });
    mkdirSync(path.dirname(targetPath), { recursive: true }); writeFileSync(targetPath, resolved);
  }
  return {
    import: (name) => import(pathToFileURL(path.join(output, name.replace(/\.ts$/, ".js"))).href),
    clean: () => rmSync(output, { recursive: true, force: true }),
  };
}
