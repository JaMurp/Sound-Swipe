


export const checkSongId = (songId) => {
    songId = songId.trim();
    if (!songId) {
        throw new Error("Song ID is required");
    }
    if (typeof songId !== 'string') {
        throw 'Invalid song ID';
    }
    songId = String(songId);
    return songId;
};

export function checkGenres(genres) {
    if (!Array.isArray(genres) || genres.length === 0) {
        throw 'Genres must be a non-empty array';
    }
    for (const genre of genres) {
        if (typeof genre !== 'string' || !genre.trim()) {
            throw 'Each genre must be a non-empty string';
        }
    }
    return genres;
};

export function checkFilters(filters) {
    if (typeof filters !== 'object' || filters === null) {
        throw 'Invalid filters';
    }
    return filters;
};

export function checkLikedFlag(value) {
    if (typeof value !== 'boolean') {
        throw 'Liked flag must be a boolean';
    }
    return value;
};
