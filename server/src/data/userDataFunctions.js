import { db, auth } from "../db/firebase.js"
import * as songsDataFunctions from './songsDataFunctions.js'


export const deleteUser = async (uid) => {
    const uidRef = db.collection('users').doc(uid);
    const user = await uidRef.get();

    if (!user.exists) throw "User not found";

    const userData = user.data();
    const userFriends = userData.friends;

    for (const friend of userFriends) {
        const fidRef = db.collection('users').doc(friend.id);
        const friendDoc = await fidRef.get();

        if (friendDoc.exists) {
            const friendData = friendDoc.data();
            const updatedFriendsList = (friendData.friends).filter(f => f.id !== uid);
            await fidRef.update({ friends: updatedFriendsList });
        }
    }

    const allUsers = await db.collection('users').get();
    for (const doc of allUsers.docs) {
        const docData = doc.data();
        const incomingRequests = docData.incomingRequests;
        const filteredRequests = incomingRequests.filter(request => request.id !== uid);
        if (filteredRequests.length !== incomingRequests.length) {
            await doc.ref.update({ incomingRequests: filteredRequests });
        }
    }

    // #TODO check uid and maybe add a fault tolerant system if a colleciton gets deleted but not a user

    // need to delete the user auth profile
    await auth.deleteUser(uid);

    // need to get the liked songs id then decrement the likeCounter
    const likedSongsRef = uidRef.collection('likedSongs');
    const likedSongsSnapshot = await likedSongsRef.get();

    for (const song of likedSongsSnapshot.docs) {
        const songId = song.id;
        await songsDataFunctions.decrementSongLikes(songId.toString());
        await song.ref.delete();
    }

    // Delete the user document
    await uidRef.delete();

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
    console.log(userObj);
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
        updateUser['username'] = newUserName;

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

export const requestFriend = async (currentUserId, friendId) => {
    const uidRef = db.collection('users').doc(currentUserId);
    const fidRef = db.collection('users').doc(friendId);
    const user = await uidRef.get()
    const friend = await fidRef.get();

    if (!user.exists || !friend.exists) throw 'User not found';

    const userData = user.data();
    const friendData = friend.data();

    if (userData.friends.some(currentFriend => currentFriend.id === friendId)) return { success: false, message: 'Friend Already Added' };
    if (friendData.incomingRequests.some(request => request.id === currentUserId)) return { success: false, message: 'Request Already Sent' };

    const notif = {
        type: "friend_request",
        fromId: currentUserId,
        username: userData.username,
        avatar_url: userData.avatar_url,
        timestamp: new Date()
    };
    await fidRef.collection("notifications").add(notif);
    await fidRef.update({
        incomingRequests: [...(friendData.incomingRequests), { id: currentUserId, avatar_url: userData.avatar_url, username: userData.username }],
    });
    return { success: true, message: 'Request Sent!' };
};

export const acceptRequest = async (currentUserId, friendId) => {
    const uidRef = db.collection('users').doc(currentUserId);
    const fidRef = db.collection('users').doc(friendId);
    const user = await uidRef.get()
    const friend = await fidRef.get();

    if (!user.exists || !friend.exists) throw 'User not found';

    const userData = user.data();
    const friendData = friend.data();

    if (userData.friends.some(currentFriend => currentFriend.id === friendId)) return { success: true, message: 'Friend Already Added' };

    await uidRef.update({
        notifications: userData.notifications.filter(notification => (notification.type !== "friend_request") && (notification.fromId !== friendId)),
        friends: [...(userData.friends), { id: friendId, avatar_url: friendData.avatar_url, username: friendData.username }],
        incomingRequests: (userData.incomingRequests).filter(request => request.id !== friendId)
    });
    await fidRef.update({ friends: [...(friendData.friends), { id: currentUserId, avatar_url: userData.avatar_url, username: userData.username }] });

    return { success: true, message: 'Friend Added!' };
};

export const rejectRequest = async (currentUserId, friendId) => {
    const uidRef = db.collection('users').doc(currentUserId);
    const user = await uidRef.get();

    if (!user.exists) throw 'User not found';

    const userData = user.data();

    await uidRef.update({ incomingRequests: (userData.incomingRequests).filter(request => request.id !== friendId) });

    return { success: true, message: 'Friend Request Rejected' };
};

export const removeFriend = async (currentUserId, friendId) => {
    const uidRef = db.collection('users').doc(currentUserId);
    const fidRef = db.collection('users').doc(friendId);
    const user = await uidRef.get()
    const friend = await fidRef.get();

    if (!user.exists || !friend.exists) throw 'User not found';

    const userData = user.data();
    const friendData = friend.data();

    await uidRef.update({ friends: (userData.friends).filter(friend => friend.id !== friendId) });
    await fidRef.update({ friends: (friendData.friends).filter(currentUser => currentUser.id !== currentUserId) });

    return { success: true, message: 'Friend Removed' };
};

export const getUser = async (uid) => {
    // #TODO check the uid 
    const users = db.collection("users");
    const uidRef = users.doc(uid)
    const foundUser = await uidRef.get()
    if (!foundUser.exists) throw "User Not Found"

    const userData = foundUser.data();
    const userFriends = userData.friends;
    const userLikes = await uidRef.collection("likedSongs").get();
    const likedSongs = userLikes.docs.map(doc => doc.id);

    const allUsers = await users.get();
    const recommendedFriends = [];

    for (const doc of allUsers.docs) {
        const docId = doc.id;
        if (!(docId === uid || userFriends.some(friend => friend.id === docId))) {

            const otherUserLikes = await db.collection("users").doc(docId).collection("likedSongs").get();
            const otherLikedSongs = otherUserLikes.docs.map(doc => doc.id);

            const sharedSongs = otherLikedSongs.filter(id => likedSongs.includes(id));

            if (recommendedFriends.length < 10) {
                recommendedFriends.push({
                    id: docId,
                    ...doc.data(),
                    score: sharedSongs.length
                });
            }
        }
    }
    recommendedFriends.sort((a, b) => b.score - a.score);

    return { ...userData, recommendedFriends: recommendedFriends };
}

export const getNotifications = async (uid, startAfterId = null) => {
    try {
        const uidRef = db.collection("users").doc(uid);
        let notifications = uidRef.collection("notifications").orderBy("timestamp", "desc").limit(20);

        if (startAfterId) {
            const loadNextDoc = await uidRef.collection("notifications").doc(startAfterId).get();
            if (loadNextDoc.exists) {
                notifications = notifications.startAfter(loadNextDoc);
            }
        }

        const allNotifs = await notifications.get();
        const notifDocs = allNotifs.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const lastVisible = allNotifs.docs[allNotifs.docs.length - 1];
        return { notifications: notifDocs, lastVisible: lastVisible ? lastVisible.id : null };

    } catch (e) {
        console.log(e);
        throw e;
    }
};

export const notifyRecommendations = async (uid) => {
    try {
        const uidRef = db.collection('users').doc(uid);
        const user = await uidRef.get()

        if (!user.exists) throw 'User not found';

        const notificationsRef = uidRef.collection("notifications");
        const today = new Date().toISOString().split('T')[0];
        const prevNotif = await notificationsRef.where("type", "==", "login_recommendations").where("lastNotified", "==", today).limit(1).get();
        if (!prevNotif.empty) {
            return { success: true, message: "Already Notified" };
        }

        const userData = await getUser(uid)
        const recs = userData.recommendedFriends;

        const notif = {
            type: "login_recommendations",
            recommendations: recs,
            lastNotified: today,
            timestamp: new Date()
        };

        await notificationsRef.add(notif);
        return { success: true, message: 'Notified Recommendations!' };

    } catch (e) {
        throw e;
    }
};

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
            genres: {
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
            friends: [],
            incomingRequests: []
        }
        // Use set with document ID instead of add
        await db.collection("users").doc(uid).set(newUser);
        return { id: uid, ...newUser };
    } catch (error) {
        console.error('Error creating user:', error);
        throw error;
    }
};

