import { db, auth } from "../db/firebase.js"


export const deleteUser = async (uid) => {
    // #TODO check uid and maybe add a fault tolerant system if a colleciton gets deleted but not a user

    // need to delete the user auth profile
    await auth.deleteUser(uid);
    // need to delete the user users collection as well
    await db.collection('users').doc(uid).delete();

    return; 
}


export const usernameTaken = async (username) => {
    const usersRef = db.collection('users');
    const querySnapshot = await usersRef.where('username', '==', username).limit(1).get();

    return !querySnapshot.empty;
};


export const updateUser = async (uid, userObj) => {
    // #TODO check the inputs and the abilit 
    let hasInput = false;
    console.log(userObj)
    const updatedObj = {}

    if (userObj.bio) {
        hasInput = true
        updatedObj['bio'] = updatedObj.bio;
    }

    if (userObj.avatar_url) {
        hasInput = true;
        updatedObj['avatar_url'] = updatedObj.avatar_url;
    }
    if (userObj.username) {
        let newUserName = userObj.username;
        newUserName = newUserName.toLowerCase()
        hasInput = true;
        const isTaken = await usernameTaken(newUserName);
        if (isTaken) throw "username is taken";
        updateUser['username'] =  newUserName;

    }
    if (userObj.explicitData !== null) {
        hasInput = true;
        updateUser['explicitData'] = userObj.explicitData;
    }

    if (!hasInput) throw "Must provide atleast 1 fields to update";

    // updates the doc
    const uidRef = db.collection('users').doc(uid); 
    await uidRef.update(userObj)
    return;

};


export const getUser = async (uid) => {
    // #TODO check the uid 
    const uidRef = db.collection("users").doc(uid)
    const foundUser = await uidRef.get()
    if (!foundUser.exists) throw "User Not Found"

    return foundUser.data() 
}


export const userExists = async (uid) => {
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
            explicitData: true,
            username: uid,
            bio: '',
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