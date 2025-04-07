// #TODO check input params

import {Router} from 'express';
import * as userDataFunc from '../data/userData.js';
import { deleteFirebaseUserByUid } from '../utils/deleteFirebaseUser.js';

const router = Router();


/**
 *  req.body: uid, birthday, isUnder18, username
 */
router.post('/create', async (req, res) => {
    const data = req.body;
    let uid;

    try {
        uid = await userDataFunc.verifyFirebaseToken(req.headers.authorization);
    } catch(e) {
        return res.status(400).json({error: e});
    }

    // checks req data
    if (!data|| Object.keys(data).length === 0) return res.status(400).json({error: 'There are no fields in the request body'});
    // #TODO check input params
    try {
        console.log("TODO CHECK VARS TO MAKE SURE THEY ARE VALID");
    } catch(e) {
        return res.status(400).json({error: e});
    }
    // creates user in db
    try {
        const confirmation = await userDataFunc.createUser(data.username, data.isUnder18, data.birthday, data.uid);
        if (!confirmation.success) {
            // removed this since i have dedicated finish profile screen
            //await deleteFirebaseUserByUid(data.uid);
            return res.status(500).json({error: 'Internal Server Error'});
        }
        return res.status(200).json(confirmation);

    } catch(e) {
        console.log(e);
        return res.status(400).json({error: e});
    }
});


/**
 * req parms: uid,
 */
router.get('/find/:uid', async (req, res) => {
    const uid = req.params.uid;  
    // #TODO check uid
    try {
        console.log("NEED TO CHECK UID")
    } catch(e) {
        return res.status(400).json({error: e})
    }
    try {
        const found = await userDataFunc.validUid(uid);
        if (found) return res.status(200).json({success: true});
        return res.status(200).json({success: false});

    } catch(_e) {
        return res.status(500).json({success: false})
    }
});


/**
 * gets the users settings
 */
router.get('/settings', async (req, res) => {
    let uid;
    try {
        uid = await userDataFunc.verifyFirebaseToken(req.headers.authorization);
    } catch(e) {
        return res.status(400).json({error: e});
    }

    try {
        const getSettings = await userDataFunc.getSettings(uid); 
        if (!getSettings) return res.status(500).json({error: 'Internal Server Error'});

        return res.status(200).json({
            success: true,
            settings: getSettings
        })
    } catch(e) {
        return res.status(404).json({error:e});
    }
});

router.post('/explicity', async (req, res) => {
    let uid;
    try {
        uid = await userDataFunc.verifyFirebaseToken(req.headers.authorization);
    } catch(e) {
        return res.status(400).json({error: e});
    }
    try {
        const updateExplicity = await userDataFunc.updateExplicity(uid); 
        if (!updateExplicity.success) return res.status(500).json({error: 'Internal Server Error'});
        return res.status(200).json(updateExplicity);

    } catch(e) {
        return res.status(404).json({error: e});
    }

})

router.post('/check-age', async (req, res) => {
    let uid;
    try {
        uid = await userDataFunc.verifyFirebaseToken(req.headers.authorization);
    } catch(e) {
        return res.status(400).json({error: e});
    }
    try {
        const result = await userDataFunc.changeUnderAge(uid);
        if (!result.success) return res.status(500).json({error: e});
        return res.status(200).json(result);
    } catch(e) {
        return res.status(404).json({error: e});
    }
})

export default router;








