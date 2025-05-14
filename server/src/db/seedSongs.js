import axios from 'axios';
import * as songsDataFunctions from '../data/songsDataFunctions.js';


// #TODO check all inputs 

const genres = [];
// calls the deezer api and return array of all the genres
const getGenres = async () => {
    const {data}= await axios.get("https://api.deezer.com/genre");
    if (!data.data) throw "Error getting the list of genres"

    for (let i = 1; i < data.data.length; i++) {
        const addGenre = {
            genreId: data.data[i].id,
            genre: data.data[i].name
        }
        genres.push(addGenre);
    }
    return genres; 
}; 

const artistAndGenre = [];
const getTopArtistFromGenre = async (genres) => {
    for (let i = 0; i < genres.length; i++) {
        const {data} = await axios.get("https://api.deezer.com/genre/" + genres[i].genreId.toString() + "/artists")

        for (let j = 0; j < data.data.length; j++) {
            const addArtist = {
                artist: {
                    artistImage: data.data[j].picture_big,
                    artistId: data.data[j].id,
                    artistName: data.data[j].name,
                },
                genre: genres[i],
            }

            artistAndGenre.push(addArtist);
        }
    };
    return artistAndGenre;

};

const songs = [];
const getTopTracksFromArtist = async (artistAndGenre) => {
    for (let i = 0; i < artistAndGenre.length; i++){
        // you can change the amount of artist here 
        const {data} = await axios.get("https://api.deezer.com/artist/" + artistAndGenre[i].artist.artistId.toString() + "/top?limit=5")
        for (let j = 0; j < data.data.length; j++) {
            if (!data.data[j].id || !data.data[j].title || !data.data[j].preview || data.data[j].explicit_lyrics === undefined || data.data[j].explicit_lyrics === null) continue; 


            const addSong = {
                songId : data.data[j].id,
                songTitle: data.data[j].title,
                songPreview: data.data[j].preview,
                explicitLyrics: data.data[j].explicit_lyrics,
                artist: artistAndGenre[i].artist,
                randomSeed: Math.random(),
                genre: artistAndGenre[i].genre
            }
            songs.push(addSong);
        }


    }
    return songs;

};

const seedSongs = async () => {
    try {
        const getGenresResponse = await getGenres();
        const getTopArtistFromGenreResponse = await getTopArtistFromGenre(getGenresResponse)
        const allSongs = await getTopTracksFromArtist(getTopArtistFromGenreResponse); 

        for (const songObj of allSongs) {
            //const doesSongExist = await songsDataFunctions.songExist(songObj.songId) 
            //if (doesSongExist) continue
             await songsDataFunctions.addSong(songObj);
            console.log(`Added song: ${songObj.songTitle} by ${songObj.artist?.artistName}`);
        }

    } catch(e) {
        console.error(e)
    }
}; 

seedSongs();














