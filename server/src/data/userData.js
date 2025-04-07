import * as userDataFunc from './helpersData/userDataHelpers.js';
import {users} from '../config/mongoCollection.js'
import { getAuth } from 'firebase-admin/auth';

/**
 * Creates a new user in the database with the provided information
 * @param {string} username - The username for the new user
 * @param {boolean} isUnder18 - Whether the user is under 18 years old
 * @param {string} birthday - The user's birthday in YYYY-MM-DD format
 * @returns {Promise<{success: boolean}>} An object indicating successful user creation
 * @throws {string} "Error: user under 13" if the user's age is less than 13
 * @throws {string} "isUnder18 and age dont match" if the isUnder18 flag doesn't match the calculated age
 * @throws {string} "User with that username exist" if a user with the same username already exists
 * @throws {string} "Insert Failed Signup" if the database insertion fails
 * @throws {string} Various validation errors from userDataHelpers functions
 */
export const createUser = async (username, isUnder18, birthday , uid) => {
    try { 
        // checks uid
        if (!uid) throw "Must provide id"
        // checks all the values
        userDataFunc.isValidBool(isUnder18); 
        birthday = userDataFunc.isValidDate(birthday);

        const age = userDataFunc.getAge(birthday);

        if (age < 13) throw "Error: user under 13"
        if (age < 18 && !isUnder18) throw "isUnder18 and age dont match";
        if (age >= 18 && isUnder18) throw "isUnder18 and age dont match";

        const usersCollection = await users();

        // makes sure there is no duplicate username
        const findUser = await usersCollection.findOne({"personal.username": username});

        // creates new user more should be added here when needed to expan
        if (findUser) throw "User with that username exist";
        const newUser = {
            firebaseUid: uid,
            personal: {
                username: username,
                underAge: isUnder18,
                birthday: birthday,
                ageRestrictions: true,
                explicity: isUnder18 ? null : true 
            }
        }
        // attemps to insert
        const insertedUser = await usersCollection.insertOne(newUser);
        if (!insertedUser) throw "Insert Failed Signup";

        return {success: true};
    } catch(e) {
        throw e;
    }
}


/**
 * Validates if a user exists in the database with the given Firebase UID
 * @param {string} uid - The Firebase Authentication UID to validate
 * @returns {Promise<boolean>} True if the user exists, throws an error if not
 * @throws {string} "must provided uid" if uid is not provided
 * @throws {string} "user not in data set" if no user is found with the given uid
 */
export const validUid = async (uid) => {
    if (!uid) return false 
    const usersCollection = await users();
    const findUser = await usersCollection.findOne({firebaseUid: uid});
    if (!findUser) return false
    return true;
} 


/**
 * this is from internet learned you have to verfiy the token since useContext could be manipulated 
 * @param {*} authHeader 
 * @returns 
 */
export const verifyFirebaseToken = async (authHeader) => {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw 'Missing or malformed authorization header';
    }

    const idToken = authHeader.split(' ')[1];

    try {
        const decoded = await getAuth().verifyIdToken(idToken);
        return decoded.uid;
    } catch (error) {
        console.error('Firebase token verification failed:', error);
        throw 'Invalid or expired token';
    }
};


/**
 * this gets a users settings 
 * @param {string} uid 
 */
export const getSettings = async (uid) => {
    if (!uid) throw "must provided uid";
    const usersCollection = await users();


    const findUserSettings = await usersCollection.findOne({firebaseUid: uid});
    if (!findUserSettings) throw "Error getting user from db";

    const {underAge,explicity } = findUserSettings.personal

    return {
        underAge: underAge,
        explicity: explicity
    }
}

/**
 * 
 * @param {*} uid 
 * @returns 
 */
export const updateExplicity = async (uid) => {
    if (!uid) throw "must provied uid";
    const usersCollection = await users();

    const findUser = await usersCollection.findOne({firebaseUid: uid});
    if (!findUser) throw "Error finding user";
    if (findUser.personal.underAge) throw "user cannot change this setting";

    let newRestriction = !(findUser.personal.explicity)

    await usersCollection.findOneAndUpdate(
        {firebaseUid: uid},
        { $set: { 'personal.explicity' : newRestriction} 
    })

    return {success: true,
        updateExplicity: newRestriction

    };
}

/**
 * 
 * @param {*} uid 
 */
export const changeUnderAge = async (uid) => {
    
    const usersCollection = await users();
    const findUser = await usersCollection.findOne({firebaseUid: uid});
    if (!findUser) throw "Error finding user";

    const age = userDataFunc.getAge(findUser.personal.birthday);
    if (age < 18) return {success: true};

    await usersCollection.findOneAndUpdate(
        { firebaseUid : uid }, 
        { $set: { 'personal.underAge': false } } 
    );


    return {success: true};
} 
