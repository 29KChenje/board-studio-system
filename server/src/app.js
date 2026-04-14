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
const hasBuiltClient = fs.existsSync(clientIndexFile);

app.use(
  cors({
    origin: true,
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
