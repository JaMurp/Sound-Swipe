import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { exec } from "child_process";
import admin from "firebase-admin";
import { v4 as uuidv4 } from "uuid";
import { checkPostUid, validateUploadedFile } from '../helpers/uploadValidation.js'

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
      validateUploadedFile(req.file);
    } catch (e) {
      return res.status(400).json({ error: e });
    }
    try {

      // Ensure uploads directory exists
      const uploadDir = path.join(__dirname, "..", "uploads");
      if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

      // Use ImageMagick (via `magick` CLI) to crop and annotate
      const magickPath = `"C:/Program Files/ImageMagick-7.1.1-Q16-HDRI/magick.exe"`;

      const command = [
        `${magickPath} "${tempInput}"`,
        `-auto-orient -resize 460x460^ -gravity center -background black -extent 512x512`,
        `-gravity south -font Arial-Bold -pointsize 50`,
        `-fill black -annotate +12+62 "Sound Swipe"`,
        `-fill white -annotate +10+60 "Sound Swipe"`,
        `"${tempOutput}"`
      ].join(" ");


      await new Promise((resolve, reject) => {
        exec(command, (err) => {
          fs.unlinkSync(tempInput); // Clean up input image
          if (err) return reject(err);
          resolve();
        });
      });

      const bucket = admin.storage().bucket();
      const destination = `profile_photos/${uid}.jpg`;

      // Generate a download token
      const downloadToken = uuidv4();

      const metadata = {
        metadata: {
          firebaseStorageDownloadTokens: downloadToken, // Required for token-based access
        },
        contentType: req.file.mimetype,
      };

      // Upload the image
      await bucket.upload(tempOutput, {
        destination,
        metadata,
      });

      fs.unlinkSync(tempOutput); // Clean up processed image

      // Construct correct Firebase download URL
      const imageUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(destination)}?alt=media&token=${downloadToken}`;

      // Store the download URL in Firestore
      await admin.firestore().collection("users").doc(uid).set(
        {
          avatar_url: imageUrl,
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



router.post("/upload-feed-photo",
  verifyFirebaseToken,
  upload.single("photo"),
  async (req, res) => {
    const postUid = req.body.postUid;
    const uid = req.user.uid;
    const tempInput = req.file.path;
    const tempOutput = path.join(__dirname, "..", "uploads", `${postUid}.jpg`);
    try {
      checkPostUid(req.body.postUid);
      validateUploadedFile(req.file);
    } catch (e) {
      return res.status(400).json({ error: e });
    }
    try {

      // Ensure uploads directory exists
      const uploadDir = path.join(__dirname, "..", "uploads");
      if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

      // Use ImageMagick (via `magick` CLI) to crop and annotate
      const magickPath = `"C:/Program Files/ImageMagick-7.1.1-Q16-HDRI/magick.exe"`;

      const command = [
        `${magickPath} "${tempInput}"`,
        `-auto-orient -resize 128x128^ -gravity center -background black -extent 128x128`,
        `"${tempOutput}"`
      ].join(" ");


      await new Promise((resolve, reject) => {
        exec(command, (err) => {
          fs.unlinkSync(tempInput); // Clean up input image
          if (err) return reject(err);
          resolve();
        });
      });

      const bucket = admin.storage().bucket();
      const destination = `feed_photos/${uid}/${postUid}.jpg`;

      // Generate a download token
      const downloadToken = uuidv4();

      const metadata = {
        metadata: {
          firebaseStorageDownloadTokens: downloadToken, // Required for token-based access
        },
        contentType: req.file.mimetype,
      };

      // Upload the image
      await bucket.upload(tempOutput, {
        destination,
        metadata,
      });

      fs.unlinkSync(tempOutput); // Clean up processed image

      // Construct correct Firebase download URL
      const imageUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(destination)}?alt=media&token=${downloadToken}`;


      res.json({ success: true, imageUrl, postUid: postUid });

    } catch (err) {
      console.error("Upload failed:", err);
      res.status(500).json({ error: "Image processing or upload failed" });
    }
  }
);


router.post("/change-feed-photo",
  verifyFirebaseToken,
  upload.single("photo"),
  async (req, res) => {
    const postUid = req.body.postUid;
    const tempInput = req.file.path;
    const uid = req.user.uid;
    const tempOutput = path.join(__dirname, "..", "uploads", `${postUid}.jpg`);
    try {
      checkPostUid(req.body.postUid);
      validateUploadedFile(req.file);
    } catch (e) {
      return res.status(400).json({ error: e });
    }
    try {

      // Ensure uploads directory exists
      const uploadDir = path.join(__dirname, "..", "uploads");
      if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

      // Use ImageMagick (via `magick` CLI) to crop and annotate
      const magickPath = `"C:/Program Files/ImageMagick-7.1.1-Q16-HDRI/magick.exe"`;

      const command = [
        `${magickPath} "${tempInput}"`,
        `-auto-orient -resize 128x128^ -gravity center -background black -extent 128x128`,
        `"${tempOutput}"`
      ].join(" ");


      await new Promise((resolve, reject) => {
        exec(command, (err) => {
          fs.unlinkSync(tempInput); // Clean up input image
          if (err) return reject(err);
          resolve();
        });
      });

      const bucket = admin.storage().bucket();
      const destination = `feed_photos/${uid}/${postUid}.jpg`;

      // Generate a download token
      const downloadToken = uuidv4();

      const metadata = {
        metadata: {
          firebaseStorageDownloadTokens: downloadToken, // Required for token-based access
        },
        contentType: req.file.mimetype,
      };

      // Upload the image
      await bucket.upload(tempOutput, {
        destination,
        metadata,
      });

      fs.unlinkSync(tempOutput); // Clean up processed image

      // Construct correct Firebase download URL
      const imageUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(destination)}?alt=media&token=${downloadToken}`;


      res.json({ success: true, imageUrl, postUid: postUid });

    } catch (err) {
      console.error("Upload failed:", err);
      res.status(500).json({ error: "Image processing or upload failed" });
    }
  }
);


export default router;



