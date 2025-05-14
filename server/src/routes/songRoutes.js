import { Router } from 'express';
import * as songsDataFunctions from '../data/songsDataFunctions.js';
import * as userDataFunctions from '../data/userDataFunctions.js';
import * as swipingFunctions from '../data/swipingFunctions.js';
import * as songValidation from '../helpers/songValidation.js';
import { io } from '../server.js';



const router = Router();


router.get('/get-audio', async (req, res) => {
    // #TODO check the inputs
    let songIdString = null;
    try {
        songIdString = songValidation.checkSongId(req.query.songId);
    } catch (e) {
        console.log(e);
        return res.status(400).json({ error: e });
    }
    try {
        const song = await songsDataFunctions.getSong(songIdString);
        if (!song || !song.preview_url) {
            return res.status(404).json({ error: "Song not found" });
        }
        return res.status(200).json({ previewUrl: song.preview_url });
    } catch (e) {
        console.log(e);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});


router.post('/', async (req, res) => {
    const genres = songValidation.checkGenres(req.body.genres);


    let explicitFlag = false;
    try {
        const { explicitData } = await userDataFunctions.getUser(req.user.uid);
        explicitFlag = explicitData;
    } catch (e) {
        console.log(e);
        return res.status(500).json({ error: 'Internal Server Error'});
    }

    try {
        console.log(genres, explicitFlag, req.user.uid);
        const getSongs = await songsDataFunctions.getSongsByGenre(genres, explicitFlag, req.user.uid);
        return res.status(200).json(getSongs);
    } catch (e) {

        console.log(e);
        return res.status(500).json({ error: 'Internal Server Error'});

    }
});


router.patch('/unlike', async (req, res) => {
    let songId = null;
    try {
        songId = songValidation.checkSongId(req.body.songId);
    } catch (e) {
        return res.status(400).json({ error: e });
    }
    try {
        const status = await songsDataFunctions.removeLikedSong(req.user.uid, songId);
        return res.status(200).json(status);
    } catch (e) {
        console.log(e);
        return res.status(500).json({ error: 'Internal Server Error'});
    }
});

router.patch('/add-liked-seen-song', async (req, res) => {
    let songId = null;
    try {
        songId = songValidation.checkSongId(req.body.songId);
    } catch (e) {
        return res.status(400).json({ error: e });
    }
    try {
        const status = await songsDataFunctions.addLikedSeenSong(req.user.uid, songId);
        return res.status(200).json(status);
    } catch (e) {
        console.log(e);
        return res.status(500).json({ error: 'Internal Server Error'});
    }
});


router.post('/like', async (req, res) => {
    try {
        const songId = songValidation.checkSongId(req.body.songId);
        const success = await songsDataFunctions.incrementSongLikes(songId.toString());
        if (!success.success) {
            return res.status(500).json({ error: success.message });
        }
        const song = await songsDataFunctions.getSong(songId.toString());

        if (!song) {
            return res.status(404).json({ error: "Song not found" });
        }
        await songsDataFunctions.addFriendLikeToFeed(req.user.uid, song);
        return res.status(200).json({ success: true, message: 'Song liked and added to feed' });

    } catch (e) {
        console.log(e);
        return res.status(500).json({ error: 'Internal Server Error'});
    }
});

router.post('/decrement-song-likes', async (req, res) => {

    try {
        const songId = songValidation.checkSongId(req.body.songId);
        const success = await songsDataFunctions.decrementSongLikes(songId.toString());
        if (success.success) {
            return res.status(200).json({ success: true, message: 'Song disliked successfully' });
        } else {
            return res.status(500).json({ error: success.message });
        }
    } catch (e) {
        console.log(e);
        return res.status(500).json({ error: 'Internal Server Error'});
    }

});

router.post('/seen', async (req, res) => {
    let songId, liked = null;
    try {
        songId = songValidation.checkSongId(req.body.songId);
        liked = songValidation.checkLikedFlag(req.body.liked);
    } catch (e) {
        console.log(e);
        return res.status(500).json({ error: 'Internal Server Error'});
    }

    //increment the index of the song in the swipe session
    // but only if the session exists

    let  needToRefresh = true;
    const sessionExists = await swipingFunctions.checkIfSessionExists(req.user.uid);
    if (sessionExists) {
        try {
            await swipingFunctions.incrementIndex(req.user.uid);
            needToRefresh = false;
        } catch (e) {
            console.log(e);
            return res.status(500).json({ error: 'Internal Server Error'});
        }
    }

    // check to make sure the user exists
    let user = null;
    try {
        user = await userDataFunctions.getUser(req.user.uid);
        console.log(user);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
    } catch (e) {
        return res.status(404).json({ error: e });
    }

    try {
        const {addedSong} = await songsDataFunctions.addSeenSong(songId, req.user.uid, liked);

        if (!addedSong) {
            return res.status(500).json({ error: 'Song not added to seen songs' });
        }
        const song = addedSong;
        if (liked) {
            // emit the song to the socket 
            if (user.showLikes === true) {
                const io = req.app.get('io');
                setImmediate(() => {
                    io.emit('new_liked_song_public', { song: song, user: user.username });
                });
            }
        }
        return res.status(200).json({success: true, message: 'Song seen successfully', needToRefresh: needToRefresh});
    } catch (e) {
        console.log(e, "error adding seen song");
        return res.status(500).json({ error: 'Internal Server Error'});
    }
});

router.post('/trending', async (req, res) => {
    const filters = songValidation.checkFilters(req.body.filters);
    try {
        const trendingSongs = await songsDataFunctions.getTopLikedSongs(filters);
        return res.status(200).json(trendingSongs);
    } catch (e) {
        console.log(e);
        return res.status(500).json({ error: 'Internal Server Error'});
    }
});

router.post('/song/alreadyLiked', async (req, res) => {
    const songId = songValidation.checkSongId(req.body.songId);
    try {
        const alreadyLiked = await songsDataFunctions.likedSongExist(songId, req.user.uid);
        return res.status(200).json({ alreadyLiked: alreadyLiked });
    } catch (e) {
        console.log(e);
        return res.status(500).json({ error: 'Internal Server Error'});
    }
});

router.get('/:songId', async (req, res) => {
    const songId = songValidation.checkSongId(req.params.songId);
    try {
        const song = await songsDataFunctions.getSong(songId);
        return res.status(200).json(song);
    } catch (e) {
        console.log(e);
        return res.status(500).json({ error: 'Internal Server Error'});
    }
});

export default router;