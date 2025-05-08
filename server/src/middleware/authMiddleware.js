import { auth } from "../db/firebase.js";

// this functiomn pareses the request and makes sure the verify the jwt firebase token before accessing the route for security
export async function verifyFirebaseToken(req, res, next) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const idToken = header.split('Bearer ')[1];

  try {
    const decodedToken = await auth.verifyIdToken(idToken);
    
    // Get additional user information
    const userRecord = await auth.getUser(decodedToken.uid);


    req.user = {
      uid: decodedToken.uid,
      email: userRecord.email,
      emailVerified: userRecord.emailVerified,
      displayName: userRecord.displayName,
      photoURL: userRecord.photoURL,
      lastSignInTime: userRecord.metadata.lastSignInTime,
      creationTime: userRecord.metadata.creationTime,
    };

    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}
