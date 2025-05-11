import {Router} from 'express';
import * as songsDataFunctions from '../data/songsDataFunctions.js';
import * as userDataFunctions from '../data/userDataFunctions.js';
import * as swipingFunctions from '../data/swipingFunctions.js';

const router = Router();


router.post('/', async (req, res) => {
    // #TODO check the inputs
    const {genres} = req.body; 


    let explicitFlag = false;
    try {
        const {explicitData} = await userDataFunctions.getUser(req.user.uid);
        explicitFlag = explicitData;
    } catch (e) {
        console.log(e);
        return res.status(500).json({error: e});
    }

    try {
        console.log(genres, explicitFlag, req.user.uid);
        const getSongs = await songsDataFunctions.getSongsByGenre(genres, explicitFlag, req.user.uid);
        return res.status(200).json(getSongs);
    } catch (e) {

        console.log(e);
        return res.status(500).json({error: e});

    }
});


router.patch('/unlike', async (req, res) => {
    // #TODO check the inputs
    console.log(req.user.uid, req.body.songId, "unlike");
    const {songId} = req.body;
    try {
        const status = await songsDataFunctions.removeLikedSong(req.user.uid, songId);
        return res.status(200).json(status);
    } catch (e) {
        console.log(e);
        return res.status(500).json({error: e});
    }
});


router.post('/like', async (req, res) => {
    // #TODO check the inputs
    const {songId} = req.body;
    try {
        const success = await songsDataFunctions.incrementSongLikes(songId.toString());
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

router.post('/seen', async (req, res) => {
    // #TODO check the inputs
    const {songId, liked} = req.body;
    //increment the index of the song in the swipe session
    try {
        await swipingFunctions.incrementIndex(req.user.uid);
    } catch (e) {
        console.log(e);
        return res.status(500).json({error: e});
    }
    try {
        console.log(songId, req.user.uid, liked, "adding seen song");
        await songsDataFunctions.addSeenSong(songId, req.user.uid, liked);
        return res.status(200).json({success: true, message: 'Song seen successfully'});
    } catch (e) {
        console.log(e, "error adding seen song");
        return res.status(500).json({error: e});
    }
});

router.post('/trending', async (req, res) => {
    const {filters} = req.body;
    try {
        const trendingSongs = await songsDataFunctions.getTopLikedSongs(filters);
        return res.status(200).json(trendingSongs);
    } catch (e) {
        console.log(e);
        return res.status(500).json({error: e});
    }
});

router.post('/song/alreadyLiked', async (req, res) => {
    const {songId} = req.body;
    try {
        const alreadyLiked = await songsDataFunctions.likedSongExist(songId, req.user.uid);
        return res.status(200).json({alreadyLiked: alreadyLiked});
    } catch (e) {
        console.log(e);
        return res.status(500).json({error: e});
    }
});

router.get('/:songId', async (req, res) => {
    const {songId} = req.params;
    try {
        const song = await songsDataFunctions.getSong(songId);
        return res.status(200).json(song);
    } catch (e) {
        console.log(e);
        return res.status(500).json({error: e});
    }
})

export default router;