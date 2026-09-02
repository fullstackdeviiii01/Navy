// scripts/replace-rehan-brand-name.ts
import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import * as dotenv from "dotenv";

dotenv.config({ path: path.join(process.cwd(), ".env.local") });

const ROOT = process.cwd();

const TARGET_DIRS = ["app", "lib", "hooks", "docs"];

const REPLACEMENTS: [RegExp, string][] = [
  [/Rehan Wooden Lamps/g, "Talal Wooden Lamps"],
  [/REHAN WOODEN LAMPS/g, "TALAL WOODEN LAMPS"],
  [/rehan wooden lamps/g, "talal wooden lamps"],
  [/Rehan Wooden Lamp/g, "Talal Wooden Lamp"],
  [/REHAN WOODEN LAMP/g, "TALAL WOODEN LAMP"],
  [/rehan wooden lamp/g, "talal wooden lamp"],
  [/Rehan Lamps/g, "Talal Wooden Lamps"],
  [/REHAN LAMPS/g, "TALAL WOODEN LAMPS"],
  [/rehanlamps\.com/g, "talalwoodenlamp.com"],
  [/rehanwoodenlamps\.com/g, "talalwoodenlamp.com"],
  [/Rehan Ahmad/g, "Talal Ahmad"],
  [/rehan048686@gmail\.com/g, "talalwoodenlamp@gmail.com"],
  [/rehan\.fullstack@gmail\.com/g, "talalwoodenlamp@gmail.com"],
];

function processFile(filePath: string) {
  try {
    let content = fs.readFileSync(filePath, "utf-8");
    let changed = false;

    for (const [regex, replacement] of REPLACEMENTS) {
      if (regex.test(content)) {
        content = content.replace(regex, replacement);
        changed = true;
      }
    }

    if (changed) {
      fs.writeFileSync(filePath, content, "utf-8");
      console.log(`Updated file: ${path.relative(ROOT, filePath)}`);
    }
  } catch (err) {
    console.error(`Error processing ${filePath}:`, err);
  }
}

function traverseDirectory(dirPath: string) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== "node_modules" && entry.name !== ".next" && entry.name !== ".git") {
        traverseDirectory(fullPath);
      }
    } else if (entry.isFile()) {
      if (/\.(tsx|ts|js|jsx|json|md|html|css)$/.test(entry.name)) {
        processFile(fullPath);
      }
    }
  }
}

async function updateDatabase() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.log("No MONGODB_URI found, skipping DB check.");
    return;
  }

  try {
    await mongoose.connect(uri);
    console.log("Connected to MongoDB for brand name audit...");

    const db = mongoose.connection.db;
    if (!db) return;

    // 1. Check SiteSettings
    const settingsColl = db.collection("sitesettings");
    const settings = await settingsColl.find({}).toArray();
    for (const s of settings) {
      let str = JSON.stringify(s);
      let updated = str
        .replace(/Rehan Wooden Lamps/g, "Talal Wooden Lamps")
        .replace(/REHAN WOODEN LAMPS/g, "TALAL WOODEN LAMPS")
        .replace(/Rehan Lamps/g, "Talal Wooden Lamps")
        .replace(/Rehan Ahmad/g, "Talal Ahmad")
        .replace(/rehanwoodenlamps/g, "talalwoodenlamps")
        .replace(/rehan/gi, "Talal");
      
      if (str !== updated) {
        const parsed = JSON.parse(updated);
        delete parsed._id;
        await settingsColl.updateOne({ _id: s._id }, { $set: parsed });
        console.log("Updated SiteSettings document.");
      }
    }

    // 2. Check Products brand
    const productsColl = db.collection("products");
    const res = await productsColl.updateMany(
      { brand: { $regex: /rehan/i } },
      { $set: { brand: "Talal Wooden Lamps" } }
    );
    if (res.modifiedCount > 0) {
      console.log(`Updated ${res.modifiedCount} products with brand: "Talal Wooden Lamps".`);
    }

    await mongoose.disconnect();
    console.log("Database update completed.");
  } catch (err) {
    console.error("DB error:", err);
  }
}

async function run() {
  for (const d of TARGET_DIRS) {
    const p = path.join(ROOT, d);
    if (fs.existsSync(p)) {
      traverseDirectory(p);
    }
  }

  await updateDatabase();
  console.log("All replacements complete!");
}

run();
