import { Router } from 'express';
import * as songsDataFunctions from '../data/songsDataFunctions.js';
import * as leaderboardFunctions from '../data/leaderboardFunctions.js';
import * as songValidation from '../helpers/songValidation.js';
import * as helpers from '../helpers/serverHelpers.js';

const router = Router();



router.post('/increment-song-likes', async (req, res) => {
    let {songId} = req.body;

    songId = songId.toString();
    try {
        const success = await songsDataFunctions.incrementSongLikes(songId);
        if (success.success) {
            return res.status(200).json({success: true, message: 'Song liked successfully'});
        } else {
            return res.status(500).json({error: success.message});
        }
    } catch (e) {
        console.log(e);
        return res.status(500).json({error: e});
    }
});

router.post('/decrement-song-likes', async (req, res) => {
    let {songId} = req.body;

    songId = songId.toString();
    try {
        const success = await songsDataFunctions.decrementSongLikes(songId);
        if (success.success) {
            return res.status(200).json({success: true, message: 'Song disliked successfully'});
        } else {
            return res.status(500).json({error: success.message});
        }
    } catch (e) {
        console.log(e);
        return res.status(500).json({error: e});
    }
});


router.post('/add-seen-song', async (req, res) => {
    let {songId, liked} = req.body;

    songId = songId.toString();

    try {
        const success = await songsDataFunctions.addSeenSong(songId, req.user.uid, liked);

        // need to remove the redis cache for swiping songs
        if (success.success) {
            await leaderboardFunctions.removeRedisCacheForSwipingSongs(req.user.uid);
            return res.status(200).json({success: true, message: 'Song seen successfully'});
        } else {
            return res.status(500).json({error: success.message});
        }
    } catch (e) {
        console.log(e);
        return res.status(500).json({error: e});
    }
});




router.get('/has-seen-song', async (req, res) => {
    // #TODO check the inputs
    let {songId} = req.query;

    songId = songId.toString();

    try {
        const haveSeen = await leaderboardFunctions.getAndCheckIfUserHasSeenSong(songId, req.user.uid);
        return res.status(200).json(haveSeen);
    } catch (e) {
        console.log(e);
        return res.status(500).json({error: e});
    }
});






export default router;

