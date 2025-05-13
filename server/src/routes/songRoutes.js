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
        const { songId } = req.query;
        if (!songId) {
            throw new Error("Song ID is required");
        }
        songIdString = songId.toString();
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
        return res.status(500).json({ error: e });
    }
})


router.post('/', async (req, res) => {
    // #TODO check the inputs
    const { genres } = req.body;


    let explicitFlag = false;
    try {
        const { explicitData } = await userDataFunctions.getUser(req.user.uid);
        explicitFlag = explicitData;
    } catch (e) {
        console.log(e);
        return res.status(500).json({ error: e });
    }

    try {
        console.log(genres, explicitFlag, req.user.uid);
        const getSongs = await songsDataFunctions.getSongsByGenre(genres, explicitFlag, req.user.uid);
        return res.status(200).json(getSongs);
    } catch (e) {

        console.log(e);
        return res.status(500).json({ error: e });

    }
});


router.patch('/unlike', async (req, res) => {
    // #TODO check the inputs
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
        return res.status(500).json({ error: e });
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
        return res.status(500).json({ error: e });
    }
})


router.post('/like', async (req, res) => {
    // #TODO check the inputs
    const { songId } = req.body;
    try {
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
        return res.status(500).json({ error: e });
    }
});

router.post('/decrement-song-likes', async (req, res) => {

    const { songId } = req.body;
    try {
        const success = await songsDataFunctions.decrementSongLikes(songId.toString());
        if (success.success) {
            return res.status(200).json({ success: true, message: 'Song disliked successfully' });
        } else {
            return res.status(500).json({ error: success.message });
        }
    } catch (e) {
        console.log(e);
        return res.status(500).json({ error: e });
    }

})

router.post('/seen', async (req, res) => {
    // #TODO check the inputs
    const { songId, liked } = req.body;
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
            return res.status(500).json({error: e});
        }
    }

    // check to make sure the user exists
    let user = null;
    try {
        user = await userDataFunctions.getUser(req.user.uid);
        console.log(user);
        if (!user) {
            return res.status(404).json({error: 'User not found'});
        }
    } catch(e) {
        return res.status(404).json({error: e});
    }

    
    try {
        console.log(songId, req.user.uid, liked, "adding seen song");
        const {addedSong} = await songsDataFunctions.addSeenSong(songId, req.user.uid, liked);

        if (!addedSong) {
            return res.status(500).json({error: 'Song not added to seen songs'});
        }
        const song = addedSong;
        if (liked) {
            // emit the song to the socket 
            if (user.showLikes === true) {
                const io = req.app.get('io');
                setImmediate(() => {
                    io.emit('new_liked_song_public', {song: song, user: user.username});
                });
            }
        }

        return res.status(200).json({success: true, message: 'Song seen successfully', needToRefresh: needToRefresh});
    } catch (e) {
        console.log(e, "error adding seen song");
        return res.status(500).json({ error: e });
    }
});

router.post('/trending', async (req, res) => {
    const { filters } = req.body;
    try {
        const trendingSongs = await songsDataFunctions.getTopLikedSongs(filters);
        return res.status(200).json(trendingSongs);
    } catch (e) {
        console.log(e);
        return res.status(500).json({ error: e });
    }
});

router.post('/song/alreadyLiked', async (req, res) => {
    const { songId } = req.body;
    try {
        const alreadyLiked = await songsDataFunctions.likedSongExist(songId, req.user.uid);
        return res.status(200).json({ alreadyLiked: alreadyLiked });
    } catch (e) {
        console.log(e);
        return res.status(500).json({ error: e });
    }
});

router.get('/:songId', async (req, res) => {
    const { songId } = req.params;
    try {
        const song = await songsDataFunctions.getSong(songId);
        return res.status(200).json(song);
    } catch (e) {
        console.log(e);
        return res.status(500).json({ error: e });
    }
})

export default router;