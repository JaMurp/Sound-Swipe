import cron from 'node-cron';
import axios from 'axios';
import client from '../config/redis.js';

const redis = client;

// list of 5 static song ids
export const songIds = [

    "2386586085",
    "1043476402",
    "1101484032",
    "114811546",
    "1425844092"
];

export const populateSongData = async () => {
    const buildSongData = [];
    for (const songId of songIds) {
        const { data: songData } = await axios.get(`https://api.deezer.com/track/${songId}`);

        const title = songData.title;
        const artist_image = songData.artist.picture_medium;
        const artist_name = songData.artist.name;
        const preview = songData.preview;

        const newSongData = {
            title,
            artist_image,
            artist_name,
            preview
        }

        buildSongData.push(newSongData);
    }
    console.log('Populating song data:', buildSongData);
    await redis.set('static_swiping_songs', JSON.stringify(buildSongData), {EX: 60 * 15});
};

const scheduleJobs = () => {
    // Run immediately when server starts
    populateSongData();

    // Schedule to run every 14 minutes
    cron.schedule('*/14 * * * *', async () => {
        await populateSongData();
    });
}

export default scheduleJobs;








