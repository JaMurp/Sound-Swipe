import admin from '../config/firebaseAdmin.js';

/**
 * Deletes a user from Firebase Authentication using their unique identifier
 * @param {string} uid - The unique identifier of the user to delete from Firebase Authentication
 * @throws {Error} If the user deletion fails or if the uid is invalid
 */
export const deleteFirebaseUserByUid = async (uid) => {
    await admin.auth().deleteUser(uid);
};
