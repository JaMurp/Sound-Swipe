import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import configRoutes from "./routes/index.js";
import profilePhotoRoutes from "./routes/profilePhoto.js";
import { verifyFirebaseToken } from "./middleware/authMiddleware.js";

// Firebase Admin imports from your JS setup
import { db, auth, bucket } from "./db/firebase.js"; // updated import

// Setup __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create Express server
const app = express();

// CORS for frontend on port 5173
app.use(cors({ origin: "http://localhost:5173" }));

// Parse incoming JSON requests
app.use(express.json());

// Static folder for public access to profile photos
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// Middleware to verify Firebase token
app.use(verifyFirebaseToken);

// Routes
app.use("/api/users", profilePhotoRoutes);
configRoutes(app);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Route Not Found!" });
});

// Start server
app.listen(3000, () => {
  console.log("Server is running on port 3000");
});

export default app;
