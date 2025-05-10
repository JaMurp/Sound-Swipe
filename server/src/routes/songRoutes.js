import {Router} from 'express';
import * as songsDataFunctions from '../data/songsDataFunctions.js';

const router = Router();


router.post('/', async (req, res) => {
    // #TODO check the inputs
    const {genres} = req.body; 
    try {
        const getSongs = await songsDataFunctions.getSongsByGenre(genres, req.user.explicitFlag, req.user.uid);
        return res.status(200).json(getSongs);
    } catch (e) {

        console.log(e);
        return res.status(500).json({error: e});

    }
});

router.post('/like', async (req, res) => {
    // #TODO check the inputs
    const {songId} = req.body;
    try {
        await songsDataFunctions.addLikedSong(songId, req.user.uid);
        return res.status(200).json({success: true, message: 'Song liked successfully'});
    } catch (e) {
        console.log(e);
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

export default router;