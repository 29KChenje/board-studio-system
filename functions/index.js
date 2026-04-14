const functions = require("firebase-functions");
const express = require("express");

const app = express();

let runtimeApp = null;
let initializePromise = null;

async function ensureInitialized() {
  if (runtimeApp) {
    return runtimeApp;
  }

  if (!initializePromise) {
    initializePromise = (async () => {
      const [{ app: importedApp }, { ensureDemoData }, { db }] = await Promise.all([
        import("./src/app.js"),
        import("./src/bootstrap/ensureDemoData.js"),
        import("./src/config/db.js")
      ]);

      await db.listCollections();
      await ensureDemoData();
      runtimeApp = importedApp;
      return runtimeApp;
    })();
  }

  return initializePromise;
}

app.use(async (req, res, next) => {
  try {
    const initializedApp = await ensureInitialized();
    return initializedApp(req, res, next);
  } catch (error) {
    return next(error);
  }
});

app.use((error, _req, res, _next) => {
  const statusCode = error.statusCode || 500;
  res.status(statusCode).json({
    message: error.message || "Internal server error",
    details: error.details || null
  });
});

exports.api = functions.https.onRequest(app);
