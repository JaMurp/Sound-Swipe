export function isValidUid(uid) {
    return typeof uid === 'string' && uid.trim().length > 0;
};

export function isValidString(str, minLength = 1, maxLength = 1000) {
    str = str.trim();
    return typeof str === 'string' && str.length >= minLength && str.length <= maxLength;
};

export function isNotEmpty(obj) {
    return obj && typeof obj === 'object' && Object.keys(obj).length > 0;
};

export function isValidUsername(username){
    return !username.includes(' ') && !(username.length > 15)
}