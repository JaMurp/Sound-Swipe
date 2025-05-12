import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { exec } from "child_process";
import admin from "firebase-admin";
import { v4 as uuidv4 } from "uuid";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const router = express.Router();

const upload = multer({ dest: "temp_uploads/" });

// Verify Firebase token middleware
const verifyFirebaseToken = async (req, res, next) => {
  const token = req.headers.authorization?.split("Bearer ")[1];
  if (!token) return res.status(401).json({ error: "No token provided" });

  try {
    const decoded = await admin.auth().verifyIdToken(token);
    req.user = decoded;
    next();
  } catch (err) {
    console.error("Token verification failed", err);
    res.status(401).json({ error: "Invalid token" });
  }
};

router.post(
  "/upload-profile-photo",
  verifyFirebaseToken,
  upload.single("photo"),
  async (req, res) => {
    const uid = req.user.uid;
    const tempInput = req.file.path;
    const tempOutput = path.join(__dirname, "..", "uploads", `${uid}.jpg`);

    try {
      console.log("Starting upload for UID:", uid);
      console.log("File received:", req.file?.path);

      // Ensure uploads directory exists
      const uploadDir = path.join(__dirname, "..", "uploads");
      if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

      // Use ImageMagick (via `magick` CLI) to crop and annotate
      const magickPath = `"C:/Program Files/ImageMagick-7.1.1-Q16-HDRI/magick.exe"`;

      const command = [
        `${magickPath} "${tempInput}"`,
        `-auto-orient -resize 512x512^ -gravity center -extent 512x512`,
        `-gravity southeast -pointsize 18 -fill white -annotate +10+10 "Sound Swipe"`,
        `"${tempOutput}"`
      ].join(" ");

      // ✅ Moved AFTER the declaration
      console.log("Running ImageMagick command:", command);

      await new Promise((resolve, reject) => {
        exec(command, (err) => {
          fs.unlinkSync(tempInput); // Clean up input image
          if (err) return reject(err);
          resolve();
        });
      });

      const bucket = admin.storage().bucket();
      const destination = `profile_photos/${uid}.jpg`;
      const metadata = {
        metadata: {
          firebaseStorageDownloadTokens: uuidv4()
        },
        contentType: req.file.mimetype,
        public: true
      };

      await bucket.upload(tempOutput, {
        destination,
        metadata
      });

      fs.unlinkSync(tempOutput); // Clean up processed image

      const imageUrl = `https://storage.googleapis.com/${bucket.name}/${destination}`;
      await admin.firestore().collection("users").doc(uid).set(
        {
          avatar_url: imageUrl
        },
        { merge: true }
      );

      res.json({ success: true, imageUrl });
    } catch (err) {
      console.error("Upload failed:", err);
      res.status(500).json({ error: "Image processing or upload failed" });
    }
  }
);

export default router;
