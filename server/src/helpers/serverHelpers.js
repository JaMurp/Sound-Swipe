export const checkBio = (bio) => {
    if (!bio) throw "Bio is required";
    if (typeof bio !== "string") throw "Bio must be a string";
    bio = bio.trim();
    if (bio.length > 160) throw "Bio must be less than 160 characters";
    return bio;
};

export const checkUsername = (username) => {
    if (!username) throw "Username is required";
    if (typeof username !== "string") throw "Username must be a string";
    username = username.trim();
    if (username.length === 0) throw "Username cannot be empty";

    if (username.length < 3 || username.length > 15) {
        throw "Username must be between 3 and 15 characters";
    }

    for (let i = 0; i < username.length; i++) {
        const char = username[i];
        const isLowercase = char >= "a" && char <= "z";
        const isNumber = char >= "0" && char <= "9";
        const isUnderscore = char === "_";
        
        if (!(isLowercase || isNumber || isUnderscore)) {
            throw "Username can only contain lowercase letters, numbers, and underscores";
        }
    }

    return username;
};

export const checkUserId = (userId) => {
    if (!userId) throw "User ID is required";

    // chang this back if error
    userId = userId.toString();

    if (typeof userId !== "string") throw "User ID must be a string";
    if (userId.trim().length === 0) throw "User ID cannot be empty";
    return userId;
};

export const checkRequestBody = (body) => {
    if (!body) throw "Request body is required";
    if (typeof body !== "object") throw "Request body must be an object";
    return body;
};

export const checkShowLikes = (showLikes) => {
    if (!showLikes) throw "Show likes is required";
    if (typeof showLikes !== "boolean") throw "Show likes must be a boolean";
    return showLikes;
};

export const checkShowLikesOnProfile = (showLikesOnProfile) => {
    if (!showLikesOnProfile) throw "Show likes on profile is required";
    if (typeof showLikesOnProfile !== "boolean") throw "Show likes on profile must be a boolean";
    return showLikesOnProfile;
};

export const checkGenres = (genres) => {
    if (!genres) throw "Genres are required";
    if (typeof genres !== "array") throw "Genres must be an array";
    return genres;
};

export const checkAvatarUrl = (avatarUrl) => {
    if (!avatarUrl) throw "Avatar URL is required";
    if (typeof avatarUrl !== "string") throw "Avatar URL must be a string";
    return avatarUrl;
};

export const checkPatchRequestBody = (body) => {
    if (!body) throw "Request body is required";
    if (typeof body !== "object") throw "Request body must be an object";

    if (body.bio) {
        checkBio(body.bio);
    }
    if (body.username) {
        checkUsername(body.username);
    }
    if (body.showLikes) {
        checkShowLikes(body.showLikes);
    }
    if (body.showLikesOnProfile) {
        checkShowLikesOnProfile(body.showLikesOnProfile);
    }
    if (body.genres) {
        checkGenres(body.genres);
    }
    if (body.avatar_url) {
        checkAvatarUrl(body.avatar_url);
    }
    
    return body;
};

export const checkLiked = (liked) => {
    if (!liked) throw "Liked is required";
    if (typeof liked !== "boolean") throw "Liked must be a boolean";
    return liked;
};

export const checkSongId = (songId) => {
    if (!songId) throw "Song ID is required";
    if (typeof songId !== "string") throw "Song ID must be a string";
    if (songId.trim().length === 0) throw "Song ID cannot be empty";
    return songId;
};



