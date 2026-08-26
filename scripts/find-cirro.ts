// scripts/find-cirro.ts
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

async function main() {
  await mongoose.connect(process.env.MONGODB_URI!);
  const db = mongoose.connection.db!;
  const products = await db.collection("products").find({}).toArray();
  
  const matches = products.filter(p => /cirro|bedside|cairo|curro/i.test(p.name));
  console.log("Matched names:", matches.map(m => m.name));
  await mongoose.disconnect();
}
main();
