import { db } from "../db/firebase.js";



export const songExist = async (id) => {
    // #TODO need to input validate
    const songsRef = db.collection("songs");
    const idToString = String(id);
    const songsDoc = await songsRef.doc(idToString).get();

    if (songsDoc.exists) {
        return true;
    }
    return false;
};

export const addSong = async (songObj) => {
    // Validate the songObj structure
    if (!songObj || !songObj.songTitle || !songObj.songPreview || !songObj.artist || !songObj.genre) {
        throw new Error('Invalid song object structure');
    }

    const newSong = {
        id: songObj.songId,
        songTitle: songObj.songTitle,
        songPreview: songObj.songPreview,
        artist: {
            artistId: songObj.artist.artistId,
            artistName: songObj.artist.artistName
        },
        genre: {
            genreId: songObj.genre.genreId,
            genre: songObj.genre.genre
        }
    };

    await db.collection("songs").doc(newSong.id.toString()).set(newSong);
    return newSong;
};



// dont need to validate this. This is for personal use;
const sizeOfCollection = async (collection) => {
    const snapshot = await db.collection(collection).get();
    return snapshot.size;
}


console.log(await sizeOfCollection("songs"))

