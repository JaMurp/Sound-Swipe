import { db } from "../db/firebase.js"

export const userExists = async (uid) => {
    console.log(uid)
  try {
    const usersRef = db.collection("users");
    const userDoc = await usersRef.doc(uid).get();
    if (userDoc.exists) {
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error checking if user exists:', error);
    throw error;
  }
};

// #TODO input validation
export const createUser = async (uid, displayName, photoUrl) => {
    try {
        const newUser = {
            id: uid,
            username: displayName,
            avatar_url: photoUrl,
            createdAt: new Date()
        }
        // Use set with document ID instead of add
        await db.collection("users").doc(uid).set(newUser);
        return { id: uid, ...newUser };
    } catch (error) {
        console.error('Error creating user:', error);
        throw error;
    }
};