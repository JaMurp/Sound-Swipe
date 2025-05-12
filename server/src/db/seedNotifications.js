import axios from 'axios';
import * as userDataFunctions from '../data/userDataFunctions.js';

const seedNotifs = async () => {
    try {

        const seedNotif =
        {
            type: "static",
            message: "fake notif",
            timestamp: new Date()
        };

        for (let i = 0; i < 40; i++) {
            const uid = // add uid here
            await userDataFunctions.addNotif(seedNotif, uid);
        }

    } catch (e) {
        console.error(e)
    }
};

seedNotifs();