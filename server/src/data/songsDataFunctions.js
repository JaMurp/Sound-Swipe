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
            artistName: songObj.artist.artistName,
            artistImage: songObj.artist.artistImage
        },
        genre: {
            genreId: songObj.genre.genreId,
            genre: songObj.genre.genre
        },
        randomSeed: songObj.randomSeed || Math.random()
    };

    await db.collection("songs").doc(newSong.id.toString()).set(newSong);
    return newSong;
};


// dont need to validate this. This is for personal use;
const sizeOfCollection = async (collection) => {
    const snapshot = await db.collection(collection).get();
    return snapshot.size;
};

//https://stackoverflow.com/questions/46798981/firestore-how-to-get-random-documents-in-a-collection
export const getSongsByGenre = async (genre) => {
  const seed = Math.random(); 
  const arr = [];

  let ref = db.collection('songs')
    .where('genre.genre', '==', genre)
    .where('randomSeed', '>=', seed)
    .orderBy('randomSeed')
    .limit(25);

  let snapshot = await ref.get();

  if (snapshot.empty) {
    ref = db.collection('songs')
      .where('genre.genre', '==', genre)
      .where('randomSeed', '<', seed)
      .orderBy('randomSeed', 'desc')
      .limit(25);

    snapshot = await ref.get();
  }

  for (const doc of snapshot.docs) {
    arr.push({ id: doc.id, ...doc.data() });
  }

  return arr;
};


