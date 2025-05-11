
import axios from 'axios';

export const getSong = async (songId) => {
    const {data} = await axios.get(`https://api.deezer.com/track/${songId}`);

    if (!data) {
        return null;
    }

    return {
        song_id: data.id,
        song_name: data.title,
        artist_name: data.artist.name,
        artist_pfp: data.artist.picture_medium,
        preview_url: data.preview,
    }
}




