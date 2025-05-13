import { db } from "../db/firebase.js";
import { FieldValue } from "firebase-admin/firestore";
import axios from "axios";
import client from "../config/redis.js";
import userDataFunctions from "./index.js";

const redis = client;
if (!redis.isReady) {
  await redis.connect();
}

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
  if (
    !songObj ||
    !songObj.songTitle ||
    !songObj.songPreview ||
    !songObj.artist ||
    !songObj.genre
  ) {
    throw new Error("Invalid song object structure");
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
    randomSeed: songObj.randomSeed || Math.random(),
    likeCounter: 0,
    explicitFlag: songObj.explicitLyrics || false,

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
// #TODO add the ability to filter by explicit tag and also for more then 1 genre
export const getSongsByGenreRandom = async (genre, explicitFlag) => {
  console.log(genre, explicitFlag);
  const seed = Math.random();
  const arr = [];

  let ref = db.collection('songs')
    .where('genre.genre', '==', genre)
    .where('explicitFlag', '==', explicitFlag)
    .where('randomSeed', '>=', seed)
    .orderBy('randomSeed')
    .limit(5);

  let snapshot = await ref.get();

  if (snapshot.empty) {
    ref = db.collection('songs')
      .where('genre.genre', '==', genre)
      .where('explicitFlag', '==', explicitFlag)
      .where('randomSeed', '<', seed)
      .orderBy('randomSeed', 'desc')
      .limit(5);

    snapshot = await ref.get();
  }

  for (const doc of snapshot.docs) {
    arr.push({ id: doc.id, ...doc.data() });
  }

  return arr;
};

// https://www.netguru.com/blog/querying-and-sorting-firestore-data
//https://firebase.google.com/docs/firestore/query-data/queries
export const getTopLikedSongs = async (filters) => {
  const songsRef = db.collection("songs");
  let execQuery = null;
  if (filters.genres.length === 0) {
    execQuery = await songsRef.orderBy("likeCounter", "desc").limit(10).get();
  } else {
    execQuery = await songsRef
      .where("genre.genre", "in", filters.genres)
      .orderBy("likeCounter", "desc")
      .limit(10)
      .get();
  }
  if (execQuery.empty) {
    throw new Error("There are no songs in the db");
  }

  const results = [];
  for (const doc of execQuery.docs) {
    results.push({ id: doc.id, ...doc.data() });
  }

  return results;
};

// # TODO chech input
export const getSongById = async (songId) => {
  const songsRef = db.collection("songs");
  const findSongSnapshot = await songsRef.doc(songId).get();
  if (findSongSnapshot.empty) throw "song with that id not found";
  return findSongSnapshot.data();
};
// # TODO check input (depricated)
export const likedSongExist = async (songId, userId) => {
  const likedSongRef = db.collection('users').doc(userId).collection('likedSongs').doc(songId.toString());
  const likedSongDoc = await likedSongRef.get();
  return likedSongDoc.exists;
};
// # TODO check input 
export const seenSongExist = async (songId, userId) => {
  const seenSongRef = db.collection('users').doc(userId).collection('seenSongs').doc(songId.toString());
  const seenSongDoc = await seenSongRef.get();
  return seenSongDoc.exists;
};

//https://stackoverflow.com/questions/50762923/how-to-increment-existing-number-field-in-cloud-firestore
export const incrementSongLikes = async (songId) => {
  const requestRef = db.collection("songs").doc(songId);
  await requestRef.update({
    likeCounter: FieldValue.increment(1),
  });
  return { success: true, message: "Incremented the liked song" };
};
export const decrementSongLikes = async (songId) => {
  const requestRef = db.collection("songs").doc(songId);
  await requestRef.update({
    likeCounter: FieldValue.increment(-1),
  });
  return { success: true, message: "Decremented the liked song" };
};
// #TODO check input
export const addLikedSong = async (songId, userId) => {
  // check to make sure it is a valid song
  songId = String(songId);

  const getSong = await getSongById(songId);
  if (!getSong) throw "Song not found";
  // check to make sure the song is not in the collection
  const inCollectionFlag = await likedSongExist(songId, userId);
  if (inCollectionFlag) throw "Song already liked";
  // need to add the song to the liked sub collection
  const newLikedSong = {
    songId: songId,
    songTitle: getSong.songTitle,
    genre: getSong.genre,
  };
  await db
    .collection("users")
    .doc(userId)
    .collection("likedSongs")
    .doc(songId)
    .set(newLikedSong);
  // increment the like counter for the song
  const success = await incrementSongLikes(songId);
  if (!success) throw "Failed to increment the like counter";

  return { success: true, message: 'Song added to liked songs' }

};

// #TODO check input
export const addSeenSong = async (songId, userId, liked) => {
  // check to make sure it is a valid song
  songId = String(songId);

  const getSong = await getSongById(songId);
  if (!getSong) throw "Song not found"

  // check to make sure the song is not in the collection
  const inCollectionFlag = await seenSongExist(songId, userId);
  if (inCollectionFlag) throw "Song already seen"

  // need to add the song to the seen sub collection
  const newSeenSong = {
    songId: songId,
    songTitle: getSong.songTitle,
    artistName: getSong.artist.artistName,
    artistImage: getSong.artist.artistImage,
    genre: getSong.genre,
    youLiked: liked,

  }
  await db.collection('users').doc(userId).collection('seenSongs').doc(songId).set(newSeenSong);
  return { success: true, message: 'Song added to seen songs' }

};

const shuffleArray = (array) => {
  return array.sort(() => Math.random() - 0.5);
};

// #TODO check the inputs
export const getSongsByGenre = async (genres, explicitFlag, userId) => {
  const selectedGenres = shuffleArray(genres).slice(0, 5);
  let songs = [];
  for (const genre of selectedGenres) {
    const songsByGenre = await getSongsByGenreRandom(genre, explicitFlag);
    for (const song of songsByGenre) {
      const inCollectionFlag = await seenSongExist(song.id, userId);
      if (song.explicitFlag === explicitFlag && !inCollectionFlag) {
        songs.push(song);
      }
    }

    songs.push(...songsByGenre);
  }
  // shuffle the songs
  songs = shuffleArray(songs);


  // remove duplicates
  const uniqueSongs = new Set();
  const filteredSongs = [];
  for (const song of songs) {
    if (!uniqueSongs.has(song.id)) {
      uniqueSongs.add(song.id);
      filteredSongs.push(song);
    }
  }


  return filteredSongs;
}




export const getRandomSongs = async (userId, explicitFlag) => {
  const seed = Math.random();
  const arr = [];

  let ref = db.collection('songs')
    .where('explicitFlag', '==', explicitFlag)
    .where('randomSeed', '>=', seed)
    .orderBy('randomSeed')
    .limit(15);

  let snapshot = await ref.get();

  if (snapshot.empty) {
    ref = db.collection('songs')
      .where('explicitFlag', '==', explicitFlag)
      .where('randomSeed', '<', seed)
      .orderBy('randomSeed', 'desc')
      .limit(15);

    snapshot = await ref.get();
  }

  for (const doc of snapshot.docs) {
    const song = { id: doc.id, ...doc.data() };
    const inCollectionFlag = await seenSongExist(song.id, userId);
    if (!inCollectionFlag) {
      arr.push(song.id);
    }
  }

  return arr;
};


export const removeLikedSong = async (userId, songId) => {
  const seenCollectionRef = db.collection('users').doc(userId).collection('seenSongs');
  await seenCollectionRef.doc(songId).update({
    youLiked: false
  });

  return { success: true, message: 'Song removed from liked songs' }
}
export const addLikedSeenSong = async (userId, songId) => {
  const seenCollectionRef = db.collection('users').doc(userId).collection('seenSongs');
  await seenCollectionRef.doc(songId).update({
    youLiked: true
  });
  return { success: true, message: 'Song added to liked songs' }
}

const getSongByIdFromApi = async (songId) => {
  const { data: response } = await axios.get(`https://api.deezer.com/track/${songId}`);
  if (!response || !response.preview) {
    throw new Error("Song not found");
  }

  return response.preview;
}

export const addFriendLikeToFeed = async (uid, song) => {
  try {
    const userData = await userDataFunctions.getUser(uid);
    const response = await db.collection('likedSongsFeed').add({
      uid,
      username: userData.username,
      songId: song.song_id,
      song_name: song.song_name,
      artist_name: song.artist_name,
      likedAt: new Date(),
    });
    return response;
  } catch (e) {
    throw e;
  }
}

export const getSong = async (songId) => {
  const songCache = await redis.get(`song:${songId}`);

  if (songCache) {
    return JSON.parse(songCache);
  }

  const songDb = await getSongById(songId);
  const songApi = await getSongByIdFromApi(songId);

  const songObj = {
    song_id: parseInt(songId),
    song_name: songDb.songTitle,
    artist_name: songDb.artist.artistName,
    artist_pfp: songDb.artist.artistImage,
    preview_url: songApi
  };

  await redis.set(`song:${songId}`, JSON.stringify(songObj), { EX: 60 * 15 });
  return songObj;
}

