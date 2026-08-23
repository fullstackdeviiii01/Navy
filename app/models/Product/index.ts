// app/models/product/index.ts
import mongoose from "mongoose";
import { ProductSchema } from "./schema";
import "./methods"; // Import to register hooks, methods, and virtuals
import { IProductDocument } from "./types";

// Export types for external use
export * from "./types";

// Force model re-compilation in development to prevent stale in-memory validators
if (process.env.NODE_ENV !== "production") {
  delete (mongoose.models as any).Product;
}

// Export the model
export default mongoose.models.Product ||
  mongoose.model<IProductDocument>("Product", ProductSchema);