import client from '../config/redis.js'
import * as apiFunctions from './apiFunctions.js'
import * as songsFunctions from './songsDataFunctions.js'
import * as usersFunctions from './userDataFunctions.js'


// connect to redis
const redis= client;
if (!redis.isReady) {
    await redis.connect();
}


export const incrementIndex = async (uid) => {
    const session = await redis.get(`swipe:session:${uid}`);
    if (!session) {
        throw new Error('Session not found');
    }
    const sessionData = JSON.parse(session);
    const timeToExpire = sessionData.expires_at - Date.now();

    sessionData.index++;
    await redis.set(`swipe:session:${uid}`, JSON.stringify(sessionData), {EX: timeToExpire});
}


const createNewSession = async (uid) => {
    const songs = [];
    // 1. get the user explicit flag
    const user = await usersFunctions.getUser(uid);
    if (!user) {
        throw new Error('User not found');
    }
    const explicitFlag = user.explicitData;
    // 2. get the songs from the database
    const song_ids = await songsFunctions.getRandomSongs(uid, explicitFlag);
    // 3. check if the songs exist in the cache if not add them to the cache
    for (const song_id of song_ids) {
        const songCache = await redis.get(`song:${song_id}`);
        const fiveMinutesInMs = 5 * 60 * 1000;
        if (!songCache) {
            const song = await apiFunctions.getSong(song_id);
            const songWithExpiry = {
                ...song,
                expires_at: Date.now() + (60 * 15 * 1000)
            };
            await redis.set(`song:${song_id}`, JSON.stringify(songWithExpiry), {EX: 60 * 15});
            songs.push(songWithExpiry);
        } else {
            const parsedSongCache = JSON.parse(songCache);
            if (parsedSongCache.expires_at < Date.now() || (parsedSongCache.expires_at - Date.now()) < fiveMinutesInMs) {
                const song = await apiFunctions.getSong(song_id);
                const songWithExpiry = {
                    ...song,
                    expires_at: Date.now() + (60 * 15 * 1000)
                };
                await redis.set(`song:${song_id}`, JSON.stringify(songWithExpiry), {EX: 60 * 15});
                songs.push(songWithExpiry);
            } else {
                songs.push(parsedSongCache);
            }
        }
    }
    // 4. build the session
    const newSession = {
        index: 0,
        songs: songs,
        expires_at: Date.now() + 60 * 15 * 1000
    }
    await redis.set(`swipe:session:${uid}`, JSON.stringify(newSession), {EX: 60 * 15});

    return newSession;
}



export const getSwipeSongs = async (uid) => {
    const songs = [];
    // First check if the user has a session
    const session = await redis.get(`swipe:session:${uid}`);

    // if the session exists and hasn't expired yet, build the session 
    if (session && JSON.parse(session).expires_at > Date.now()) {
        // 1. gets the data from the session
        const sessionData = JSON.parse(session);
        const index = sessionData.index;



        console.log(index, sessionData.songs.length, "index and length");
        if (index >= sessionData.songs.length - 1) {
            await redis.del(`swipe:session:${uid}`);
            return await createNewSession(uid);
        }

        const song_ids = sessionData.songs.map(song => song.song_id);

        // 2. check if the songs exist in the cache
        for (const song_id of song_ids) {
            const songCache = await redis.get(`song:${song_id}`);
            if (songCache) {
                const parsedSongCache = JSON.parse(songCache);
                if (parsedSongCache.expires_at > Date.now()) {
                    songs.push(parsedSongCache);
                } else {
                    const song = await apiFunctions.getSong(song_id);

                    if (!song) {
                        throw "song not found";
                    }

                    const songWithExpiry = {
                        ...song,
                        expires_at: Date.now() + (60 * 15 * 1000)
                    };
                    await redis.set(`song:${song_id}`, JSON.stringify(songWithExpiry), {EX: 60 * 15});
                    songs.push(songWithExpiry);
                }
            } else {
                const song = await apiFunctions.getSong(song_id);

                if (!song) {
                    throw "song not found";
                }

                const songWithExpiry = {
                    ...song,
                    expires_at: Date.now() + (60 * 15 * 1000)
                };
                await redis.set(`song:${song_id}`, JSON.stringify(songWithExpiry), {EX: 60 * 15});
                songs.push(songWithExpiry);
            }
        }
        // 3. update the session
        const newSession = {
            index: index,
            songs: songs,
            expires_at: Date.now() + (60 * 15 * 1000)
        };
        await redis.set(`swipe:session:${uid}`, JSON.stringify(newSession), {EX: 60 * 15});
        // 4. return the session
        return newSession;

    }
    // if the session doesn't exist or has expired, create a new session
    return await createNewSession(uid);

}



//test the function
// try {
//     const session = await getSwipeSongs('1Pi7Xr9zTPfSco2JX2MpIJqOvKA2');
//     console.log(session);
// } catch (error) {
//     console.error(error);
// }



