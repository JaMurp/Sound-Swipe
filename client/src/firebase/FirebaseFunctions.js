// firebase functions
import {
    getAuth,
    createUserWithEmailAndPassword,
    signOut,
    updateProfile,
    signInWithEmailAndPassword,
    updatePassword,
    signInWithPopup,
    GoogleAuthProvider,
    sendPasswordResetEmail,
    EmailAuthProvider,
    reauthenticateWithCredential,
    deleteUser,
} from 'firebase/auth'

const doDeleteCurrentUser = async () => {
    const auth = getAuth();
    try {
        const user = auth.currentUser;
        if (user) {
            await deleteUser(user);
        } else {
            throw new Error('No user currently signed in');
        }
    } catch (e) {
        throw e;
    }
};

const doCreateUserWithEmailAndPassword = async(email, password, displayName) => {
    const auth = getAuth();
    try {
        await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(auth.currentUser, { displayName: displayName });
    } catch (e) {
        throw e
    }
}
const doChangePassword = async (email, oldPassword, newPassword) => {
    const auth = getAuth();
    try {
        let credential = EmailAuthProvider.credential(email, oldPassword);
        await reauthenticateWithCredential(auth.currentUser, credential);
        await updatePassword(auth.currentUser, newPassword);
        await doSignOut();
    } catch (e) {
        throw e
    }
}
const doSignInWithEmailAndPassword = async (email, password) => {
    const auth = getAuth();
    try {
        const userCredentials = await signInWithEmailAndPassword(auth, email, password);
        return userCredentials;
    } catch (e) {
        throw e
    }
}
const doSocialSignIn = async () => {
    const auth = getAuth();
    try {
        const socialProvider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, socialProvider);
        return result.user;
    } catch (e) {
        throw e
    }
}

const doPasswordReset = async (email) => {
    const auth = getAuth();
    try {
        await sendPasswordResetEmail(auth, email);
    } catch (e) {
        throw e
    }
}

const doSignOut = async () => {
    const auth = getAuth();
    try {
        await signOut(auth);
    } catch (e) {
        throw e
    }
}

export {
    doCreateUserWithEmailAndPassword,
    doChangePassword,
    doSignInWithEmailAndPassword,
    doSocialSignIn,
    doPasswordReset,
    doSignOut,
    doDeleteCurrentUser,
}















