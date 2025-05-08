import { db, auth } from "../db/firebase.js"
import * as songsDataFunctions from './songsDataFunctions.js'


export const deleteUser = async (uid) => {
    // #TODO check uid and maybe add a fault tolerant system if a colleciton gets deleted but not a user

    // need to delete the user auth profile
    await auth.deleteUser(uid);

    // need to get the liked songs id then decrement the likeCounter
    const likedSongsRef = db.collection('users').doc(uid).collection('likedSongs');
    const likedSongsSnapshot = await likedSongsRef.get();
    
    for (const song of likedSongsSnapshot.docs) {
        const songId = song.id;
        await songsDataFunctions.decrementSongLikes(songId.toString());
        await song.ref.delete();
    }

    // Delete the user document
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

    if (userObj.genres) {
        hasInput = true;
        updatedObj['genres'] = userObj.genres;
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
            createdAt: new Date(),
            genres : {
                "Pop": true,
                "Rap/Hip Hop": true,
                "Reggaeton": true,
                "Rock": true,
                "Dance": true,
                "R&B": true,
                "Alternative": true,
                "Christian": true,
                "Electro": true,
                "Folk": true,
                "Reggae": true,
                "Jazz": true,
                "Country": true,
                "Salsa": true,
                "Traditional Mexicano": true,
                "Classical": true,
                "Films/Games": true,
                "Metal": true,
                "Soul & Funk": true,
                "African Music": true,
                "Asian Music": true,
                "Blues": true,
                "Brazilian Music": true,
                "Cumbia": true,
                "Indian Music": true,
                "Kids": true,
                "Latin Music": true
            },
            friends : []
        }
        // Use set with document ID instead of add
        await db.collection("users").doc(uid).set(newUser);
        return { id: uid, ...newUser };
    } catch (error) {
        console.error('Error creating user:', error);
        throw error;
    }
};