// firebaseAdmin.js
import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const serviceAccount = JSON.parse(
  readFileSync(join(__dirname, '../../serviceAccountKey.json'), 'utf8')
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://sound-swipe-d6797.firebaseio.com',
  storageBucket: 'sound-swipe-d6797.firebasestorage.app'
});

const db = admin.firestore();
const auth = admin.auth();
const bucket = admin.storage().bucket();

export { db, auth, bucket };
