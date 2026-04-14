// server/src/server.js
// Entry point for the Board Studio API server.
import { db } from "./config/db.js";
import { ensureDemoData } from "./bootstrap/ensureDemoData.js";
import { env } from "./config/env.js";
import { app } from "./app.js";

const start = async () => {
  try {
    await db.listCollections();
    const demoData = await ensureDemoData();
    app.listen(env.port, "0.0.0.0", () => {
      console.log(`Board Studio System API running on port ${env.port}`);
      console.log(`Admin accounts ready: ${demoData.adminEmails.join(", ")}`);
    });
  } catch (error) {
    console.error("Failed to start server", error);
    process.exit(1);
  }
};

start();