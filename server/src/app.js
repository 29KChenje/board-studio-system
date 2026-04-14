import cors from "cors";
import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { env } from "./config/env.js";
import { uploadDirectory } from "./config/upload.js";
import { errorMiddleware } from "./middleware/errorMiddleware.js";
import { requestLoggerMiddleware } from "./middleware/requestLoggerMiddleware.js";
import adminRoutes from "./routes/adminRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import exportRoutes from "./routes/exportRoutes.js";
import modelRoutes from "./routes/modelRoutes.js";
import optimizationRoutes from "./routes/optimizationRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import pieceRoutes from "./routes/pieceRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";

export const app = express();
const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(currentDirectory, "..", "..");
const clientDistDirectory = path.resolve(projectRoot, "client", "dist");
const clientIndexFile = path.join(clientDistDirectory, "index.html");
const allowedOrigins = Array.from(
  new Set(
    [
      env.clientUrl,
      "http://localhost:5173",
      "http://127.0.0.1:5173",
      "http://localhost:5175",
      "http://127.0.0.1:5175",
      "http://localhost:4173",
      "http://127.0.0.1:4173"
    ].filter(Boolean)
  )
);

const isAllowedOrigin = (origin) => {
  if (!origin || allowedOrigins.includes(origin)) {
    return true;
  }

  try {
    const { hostname, protocol } = new URL(origin);
    if (!["http:", "https:"].includes(protocol)) {
      return false;
    }

    return (
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname === "::1" ||
      /^192\.168\.\d{1,3}\.\d{1,3}$/.test(hostname) ||
      /^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname) ||
      /^172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3}$/.test(hostname)
    );
  } catch {
    return false;
  }
};

app.use(
  cors({
    origin(origin, callback) {
      if (isAllowedOrigin(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true
  })
);
app.use(requestLoggerMiddleware);
app.use(express.json());
app.use("/uploads", express.static(path.resolve(uploadDirectory)));

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", name: "Board Studio System API" });
});

app.use("/api", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/pieces", pieceRoutes);
app.use("/api/optimize", optimizationRoutes);
app.use("/api/3d-model", modelRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/exports", exportRoutes);
app.use("/api/admin", adminRoutes);

if (hasBuiltClient) {
  app.use(express.static(clientDistDirectory));

  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api") || req.path.startsWith("/uploads")) {
      next();
      return;
    }

    res.sendFile(clientIndexFile);
  });
}

app.use(errorMiddleware);
