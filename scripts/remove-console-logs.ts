import fs from "fs";
import path from "path";

function getAllSourceFiles(dir: string, fileList: string[] = []): string[] {
  if (!fs.existsSync(dir)) return fileList;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (
        entry.name === "node_modules" ||
        entry.name === ".next" ||
        entry.name === ".git" ||
        entry.name === "scripts"
      ) {
        continue;
      }
      getAllSourceFiles(fullPath, fileList);
    } else if (
      entry.name.endsWith(".ts") ||
      entry.name.endsWith(".tsx") ||
      entry.name.endsWith(".js") ||
      entry.name.endsWith(".jsx")
    ) {
      fileList.push(fullPath);
    }
  }
  return fileList;
}

const rootDirs = [
  path.join(process.cwd(), "app"),
  path.join(process.cwd(), "lib"),
  path.join(process.cwd(), "hooks"),
  path.join(process.cwd(), "utils"),
  path.join(process.cwd(), "context"),
];

const files: string[] = [];
rootDirs.forEach((d) => getAllSourceFiles(d, files));

console.log(`Analyzing ${files.length} application files for console.log statements...`);

let totalLogsRemoved = 0;
let filesModified = 0;

for (const file of files) {
  const original = fs.readFileSync(file, "utf8");
  if (!original.includes("console.log")) continue;

  const lines = original.split("\n");
  const newLines: string[] = [];
  let fileRemoved = 0;
  let inMultiLineLog = false;
  let parenDepth = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (!inMultiLineLog) {
      // Check if line contains console.log
      if (line.includes("console.log")) {
        // Count open and close parentheses
        const logIndex = line.indexOf("console.log");
        const afterLog = line.slice(logIndex);
        let openP = 0;
        let closeP = 0;
        for (const char of afterLog) {
          if (char === "(") openP++;
          if (char === ")") closeP++;
        }

        if (openP > 0 && openP === closeP) {
          // Single line console.log:
          // If the line is only the console.log (with indentation and optional semicolon), remove line completely
          const trimmed = line.trim();
          if (
            trimmed.startsWith("console.log(") &&
            (trimmed.endsWith(");") || trimmed.endsWith(")"))
          ) {
            fileRemoved++;
            continue; // drop line
          } else {
            // It might be inside a statement or arrow function
            // e.g. .then(res => console.log(res)) or { console.log(x); doSomething(); }
            const cleaned = line.replace(/console\.log\([^)]*\);?/g, "");
            if (cleaned.trim() === "") {
              fileRemoved++;
              continue;
            }
            newLines.push(cleaned);
            fileRemoved++;
            continue;
          }
        } else if (openP > closeP) {
          // Multiline console.log starting here
          parenDepth = openP - closeP;
          inMultiLineLog = true;
          fileRemoved++;
          continue;
        }
      }
      newLines.push(line);
    } else {
      // Inside multiline console.log
      for (const char of line) {
        if (char === "(") parenDepth++;
        if (char === ")") parenDepth--;
      }
      if (parenDepth <= 0) {
        inMultiLineLog = false;
      }
      // skip this line
      continue;
    }
  }

  if (fileRemoved > 0) {
    fs.writeFileSync(file, newLines.join("\n"), "utf8");
    console.log(
      `Removed ${fileRemoved} console.log in: ${path.relative(process.cwd(), file)}`
    );
    totalLogsRemoved += fileRemoved;
    filesModified++;
  }
}

console.log(`\n========================================`);
console.log(`TOTAL CONSOLE.LOGS REMOVED: ${totalLogsRemoved}`);
console.log(`FILES MODIFIED: ${filesModified}`);
console.log(`========================================`);
