import { db } from "../src/config/db.js";
import { ensureDemoData } from "../src/bootstrap/ensureDemoData.js";

const seed = async () => {
  const credentials = await ensureDemoData();
  console.log("Firestore seed complete.");
  console.log(`Admin accounts ready: ${credentials.adminEmails.join(", ")}`);
};

seed()
  .then(async () => {
    await db.terminate();
  })
  .catch(async (error) => {
    console.error("Failed to seed Firestore", error);
    await db.terminate();
    process.exit(1);
  });
