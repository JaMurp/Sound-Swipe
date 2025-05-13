import client from '../config/redis.js';
import { db, auth } from "../db/firebase.js"



const redis = client;

// this function will check if the user has seen a song if they have it will return if they liked it or not
export const getAndCheckIfUserHasSeenSong = async (songId, userId) => {
    const userCollectionRef = db.collection('users').doc(userId).collection('seenSongs');
    const doc = await userCollectionRef.doc(songId).get();
    if (doc.exists) {
        return {success: true, message: 'Song seen successfully', haveSeen: true, haveLiked: doc.data().youLiked};
    }
    return {success: true, message: 'Song seen successfully', haveSeen: false, haveLiked: false};
}


export const removeRedisCacheForSwipingSongs = async (userId) => {
    await redis.del(`swipe:session:${userId}`);
}