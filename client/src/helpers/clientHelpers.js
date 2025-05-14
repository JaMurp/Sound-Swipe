export const validateBio = (bio) => {
    if (!bio) throw "Bio is required";
    if (typeof bio !== "string") throw "Bio must be a string";
    bio = bio.trim();
    if (bio.length > 160) throw "Bio must be less than 160 characters";
    return bio;
};

export const validateUsername = (username) => {
    if (!username) throw "Username is required";
    if (typeof username !== "string") throw "Username must be a string";
    if (username.trim().length === 0) throw "Username cannot be empty";
    username = username.trim();

    for (let i = 0; i < username.length; i++) {
        if (username[i] === " ") throw "Username cannot contain spaces";
        if (username[i] < "a" || username[i] > "z" && username[i] < "0" || username[i] > "9" && username[i] < "A" || username[i] > "Z" && username[i] !== "_") throw "Username can only contain lowercase letters, numbers, and underscores";
    }

    if (username.length < 3) throw "Username must be at least 3 characters";
    if (username.length > 15) throw "Username must be less than 15 characters";
    return username;
};

export const validateShowLikes = (showLikes) => {
    if (typeof showLikes !== "boolean") throw "Show likes must be a boolean";
    return showLikes;
};

export const validateShowLikesOnProfile = (showLikesOnProfile) => {
    if (typeof showLikesOnProfile !== "boolean") throw "Show likes on profile must be a boolean";
    return showLikesOnProfile;
};

export const validateExplicitData = (explicitData) => {
    if (typeof explicitData !== "boolean") throw "Explicit data must be a boolean";
    return explicitData;
};

export const validateProfileUpdate = (data) => {
    const validatedData = {};
    
    if (data.username !== undefined) {
        validatedData.username = validateUsername(data.username);
    }
    if (data.bio !== undefined) {
        validatedData.bio = validateBio(data.bio);
    }
    if (data.showLikes !== undefined) {
        validatedData.showLikes = validateShowLikes(data.showLikes);
    }
    if (data.showLikesOnProfile !== undefined) {
        validatedData.showLikesOnProfile = validateShowLikesOnProfile(data.showLikesOnProfile);
    }
    if (data.explicitData !== undefined) {
        validatedData.explicitData = validateExplicitData(data.explicitData);
    }
    
    return validatedData;
};
