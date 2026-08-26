// scripts/compare-exact-names.ts
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const userList = [
  "Wall Leaning Standing Floor Wooden Lamp",
  "Tipped Hat Wooden Standing Lamp",
  "Sigma Floor lamp",
  "Pattern Ring Floor lamp",
  "Modern Wooden Tripod Standing Lamp",
  "Briar Floor Lamps",
  "Mushroom Floor Lamp",
  "Nordic Vertical LED Wooden Standing Indoor Lamp",
  "Wooden log Cutting Lamp",
  "The Zoro Table Lamp",
  "VECTOR Table Lamp | Wooden Bedside",
  "Romeo Wooden lamp",
  "Rhodes Wooden Lamp",
  "Red Rock Wooden Table Lamp",
  "Rambo Wood Table Lamp",
  "Cirro Bedside Table Lamp",
  "Nostalgic Totally Customize Wooden Lamp",
  "Hunter Charred Wood Lamp",
  "Lovers on the Bench Table Lamp",
  "Mushroom Wooden Lamp",
  "Rustic Vibes 6 Light Rope Chandelier",
  "Rustic Wood Beam LED Pendant Hanging Wooden Lamp",
  "Linear LED Pendant Hanging Wooden Lamp",
  "Minimalist Ash Wood Linear LED Pendant",
  "Wooden Pillar Candlestick Holder",
  "Tempe Wooden Candle Holder",
  "Tapered Silhouette Wooden Candle Holders",
  "Pallet Wall mounted Wooden Candle Holders",
  "Mercana Candelero Wooden Round Candlestick Holder",
  "Interlocking Timber Wooden Tealight Holder",
  "Floor Standing Candle Holders (set of 3)",
  "Oak Candlestick Holder (Set of 3)",
  "Treen Turned Oak Candlestick Holder",
  "Handmade Wood Stack Candle Holders",
  "Lamcy Plaza Wooden Candlestick Holder",
  "Modern Wooden Tealight Candle Holder",
  "Rope Wall Hanging Sconce",
  "Handcrafted Linear Wall Lamp",
];

async function main() {
  await mongoose.connect(process.env.MONGODB_URI!);
  const db = mongoose.connection.db!;
  const products = await db.collection("products").find({}).toArray();

  let exactMatches = 0;
  let caseMatches = 0;
  let missing = 0;

  console.log("=== EXACT NAME COMPARISON ===\n");
  userList.forEach((inputName, i) => {
    const exact = products.find(p => p.name === inputName);
    const caseInsensitive = products.find(p => p.name.toLowerCase().trim() === inputName.toLowerCase().trim());

    if (exact) {
      exactMatches++;
      console.log(`${i+1}. [EXACT 100%] "${inputName}"`);
    } else if (caseInsensitive) {
      caseMatches++;
      console.log(`${i+1}. [CASE/PUNCTUATION MATCH] Input: "${inputName}" -> DB: "${caseInsensitive.name}"`);
    } else {
      missing++;
      console.log(`${i+1}. [NOT FOUND] "${inputName}"`);
    }
  });

  console.log(`\nExact character-for-character matches: ${exactMatches}`);
  console.log(`Case/trim matches: ${caseMatches}`);
  console.log(`Missing: ${missing}`);

  await mongoose.disconnect();
}
main();
