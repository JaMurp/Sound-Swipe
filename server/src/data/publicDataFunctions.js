import redis from '../config/redis.js';
import * as homePageJobs from '../scheduler/home_page_jobs.js';

export const getStaticSwipingSongs = async () => {
    let songs = await redis.get('static_swiping_songs');
    if (!songs) {
        await homePageJobs.populateSongData();
        songs = await redis.get('static_swiping_songs');
    }
    return JSON.parse(songs);
}


