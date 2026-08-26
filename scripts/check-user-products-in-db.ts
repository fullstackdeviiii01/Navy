// scripts/check-user-products-in-db.ts
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/sysfoc_ecommerce";

const userList = [
  // Floor Lamp
  { category: "Floor Lamp", name: "Wall Leaning Standing Floor Wooden Lamp" },
  { category: "Floor Lamp", name: "Tipped Hat Wooden Standing Lamp" },
  { category: "Floor Lamp", name: "Sigma Floor lamp" },
  { category: "Floor Lamp", name: "Pattern Ring Floor lamp" },
  { category: "Floor Lamp", name: "Modern Wooden Tripod Standing Lamp" },
  { category: "Floor Lamp", name: "Briar Floor Lamps" },
  { category: "Floor Lamp", name: "Mushroom Floor Lamp" },
  { category: "Floor Lamp", name: "Nordic Vertical LED Wooden Standing Indoor Lamp" },

  // Table Lamp
  { category: "Table Lamp", name: "Wooden log Cutting Lamp" },
  { category: "Table Lamp", name: "The Zoro Table Lamp" },
  { category: "Table Lamp", name: "VECTOR Table Lamp | Wooden Bedside" },
  { category: "Table Lamp", name: "Romeo Wooden lamp" },
  { category: "Table Lamp", name: "Rhodes Wooden Lamp" },
  { category: "Table Lamp", name: "Red Rock Wooden Table Lamp" },
  { category: "Table Lamp", name: "Rambo Wood Table Lamp" },
  { category: "Table Lamp", name: "Cirro Bedside Table Lamp" },
  { category: "Table Lamp", name: "Nostalgic Totally Customize Wooden Lamp" },
  { category: "Table Lamp", name: "Hunter Charred Wood Lamp" },
  { category: "Table Lamp", name: "Lovers on the Bench Table Lamp" },
  { category: "Table Lamp", name: "Mushroom Wooden Lamp" },

  // Hanging lamp
  { category: "Hanging Lamp", name: "Rustic Vibes 6 Light Rope Chandelier" },
  { category: "Hanging Lamp", name: "Rustic Wood Beam LED Pendant Hanging Wooden Lamp" },
  { category: "Hanging Lamp", name: "Linear LED Pendant Hanging Wooden Lamp" },
  { category: "Hanging Lamp", name: "Minimalist Ash Wood Linear LED Pendant" },

  // Candle Lamp
  { category: "Candle Lamp", name: "Wooden Pillar Candlestick Holder" },
  { category: "Candle Lamp", name: "Tempe Wooden Candle Holder" },
  { category: "Candle Lamp", name: "Tapered Silhouette Wooden Candle Holders" },
  { category: "Candle Lamp", name: "Pallet Wall mounted Wooden Candle Holders" },
  { category: "Candle Lamp", name: "Mercana Candelero Wooden Round Candlestick Holder" },
  { category: "Candle Lamp", name: "Interlocking Timber Wooden Tealight Holder" },
  { category: "Candle Lamp", name: "Floor Standing Candle Holders (set of 3)" },
  { category: "Candle Lamp", name: "Oak Candlestick Holder (Set of 3)" },
  { category: "Candle Lamp", name: "Treen Turned Oak Candlestick Holder" },
  { category: "Candle Lamp", name: "Handmade Wood Stack Candle Holders" },
  { category: "Candle Lamp", name: "Lamcy Plaza Wooden Candlestick Holder" },
  { category: "Candle Lamp", name: "Modern Wooden Tealight Candle Holder" },

  // Wall Lamp
  { category: "Wall Lamp", name: "Rope Wall Hanging Sconce" },
  { category: "Wall Lamp", name: "Handcrafted Linear Wall Lamp" },
];

function normalize(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]/g, "");
}

async function main() {
  await mongoose.connect(MONGODB_URI);
  const db = mongoose.connection.db;
  if (!db) throw new Error("DB not connected");

  const products = await db.collection("products").find({}).toArray();

  console.log(`Total Products in Database: ${products.length}\n`);

  let matchedCount = 0;
  let missingCount = 0;

  const resultsByCategory: Record<string, Array<{ input: string; matchedInDb: string | null; id?: string }>> = {};

  for (const item of userList) {
    const normInput = normalize(item.name);
    
    // Find exact or closest match
    let match = products.find((p) => normalize(p.name) === normInput);
    if (!match) {
      match = products.find(
        (p) =>
          normalize(p.name).includes(normInput) ||
          normInput.includes(normalize(p.name))
      );
    }

    if (!resultsByCategory[item.category]) {
      resultsByCategory[item.category] = [];
    }

    if (match) {
      matchedCount++;
      resultsByCategory[item.category].push({
        input: item.name,
        matchedInDb: match.name,
        id: match._id.toString(),
      });
    } else {
      missingCount++;
      resultsByCategory[item.category].push({
        input: item.name,
        matchedInDb: null,
      });
    }
  }

  console.log("=== RESULTS BREAKDOWN ===");
  for (const [cat, items] of Object.entries(resultsByCategory)) {
    console.log(`\n### ${cat} (${items.filter((i) => i.matchedInDb).length}/${items.length} Present)`);
    items.forEach((it, idx) => {
      if (it.matchedInDb) {
        console.log(`  ${idx + 1}. [FOUND] "${it.input}" -> DB: "${it.matchedInDb}" (ID: ${it.id})`);
      } else {
        console.log(`  ${idx + 1}. [MISSING] "${it.input}"`);
      }
    });
  }

  console.log(`\n========================================`);
  console.log(`TOTAL IN USER LIST: ${userList.length}`);
  console.log(`MATCHED IN DB: ${matchedCount}/${userList.length}`);
  console.log(`MISSING FROM DB: ${missingCount}/${userList.length}`);
  console.log(`========================================`);

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
