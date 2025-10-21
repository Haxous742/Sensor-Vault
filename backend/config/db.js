import mongoose from "mongoose";
import { importTeamsFromCSV } from "../scripts/importTeams.js";

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MONGODB CONNECTED SUCCESSFULLY!");

    // --- Run your CSV import after DB connection ---
    await importTeamsFromCSV();
    console.log("✅ Team data imported successfully from CSV!");
  } catch (error) {
    console.error("❌ Error connecting to MONGODB or importing teams:", error);
    process.exit(1);
  }
};
