// app/models/product/index.ts
import mongoose from "mongoose";
import { ProductSchema } from "./schema";
import "./methods" // Import to register hooks, methods, and virtuals
import { IProductDocument } from "./types";

// Export types for external use
export * from "./types";

// Export the model
export default mongoose.models.Product ||
  mongoose.model<IProductDocument>("Product", ProductSchema);