import fs from "fs";
import path from "path";

function getAllFiles(dir: string, fileList: string[] = []): string[] {
  if (!fs.existsSync(dir)) return fileList;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      getAllFiles(fullPath, fileList);
    } else if (file.endsWith(".tsx") || file.endsWith(".ts")) {
      fileList.push(fullPath);
    }
  }
  return fileList;
}

const adminDir = path.join(process.cwd(), "app", "(admin)");
const files = getAllFiles(adminDir);

console.log(`Found ${files.length} admin files.`);

let modifiedCount = 0;

for (const file of files) {
  let content = fs.readFileSync(file, "utf8");
  const original = content;

  // Remove font-serif and font-mono from all classNames
  content = content.replace(/\bfont-serif\b\s*/g, "");
  content = content.replace(/\bfont-mono\b\s*/g, "");

  // Clean up any double spaces inside className strings that might be left
  content = content.replace(/className="([^"]*)"/g, (match, classNames) => {
    const cleaned = classNames.replace(/\s+/g, " ").trim();
    return `className="${cleaned}"`;
  });

  if (content !== original) {
    fs.writeFileSync(file, content, "utf8");
    console.log(`Updated typography in: ${path.relative(process.cwd(), file)}`);
    modifiedCount++;
  }
}

console.log(`\n========================================`);
console.log(`TOTAL ADMIN FILES UPDATED: ${modifiedCount}`);
console.log(`========================================`);
