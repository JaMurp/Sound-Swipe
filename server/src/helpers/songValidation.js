


export const checkSongId = (songId) => {
    if (!songId) {
        throw new Error("Song ID is required");
    }
    songId = String(songId);
    return songId;
}


