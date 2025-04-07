import React, { useEffect, useState, useContext } from 'react';
import * as authHelpers from '../../helpers/authHelper.js';
import { deleteUser, getIdToken } from 'firebase/auth';
import { AuthContext } from '../../context/AuthContext';
import axios from 'axios';
import { Navigate, useNavigate } from 'react-router-dom';
import { FinishedProfileContext } from '../../context/FinishedProfileContext.jsx';

const FinishProfile = () => {
    const [error, setError] = useState(null);

    let isUnder18;
    const navigate = useNavigate()
    const {currentUser} = useContext(AuthContext);
    const {finishedProfile, setFinishedProfile} = useContext(FinishedProfileContext)

    const handleFinishProfile = async  (e) => {
        e.preventDefault();
        // gets the input
        const {birthday} = e.target.elements;

        try {
            // checks to make sure valid date
            authHelpers.isValidDate(birthday.value);
            // wont be a able to make account if under 13
            authHelpers.isUnder13(birthday.value);
            // returns whether user is over 18
            isUnder18 = authHelpers.isUnder18(birthday.value);
        } catch(e) {
            console.log(e);
            setError(e); 
            return 
        }

        const idToken = await currentUser.getIdToken();

        try {
            // 1. check to make sure user doesnt have a profile already 
                await axios.post(
                    'http://localhost:3000/api/users/create',
                {
                    // body
                    username: currentUser.displayName,
                    birthday: birthday.value,
                    isUnder18: isUnder18,
                    uid: currentUser.uid
                },
                {
                    headers: {
                        Authorization: `Bearer ${idToken}`
                    }
                }
            );

            setFinishedProfile(true);
            navigate('/dashboard');
        } catch(e) {
            console.log(e);
            alert("something went wrong " + e);
        }
    };



    if (finishedProfile) {
        return <Navigate to='/dashboard' />
    } else {
        return (
            <>
                <h1>Need to finish profile setup</h1>
                {error && <h2>{error}</h2>}
                <form onSubmit={handleFinishProfile}>
                    <label htmlFor='birthday'>Enter Age
                        <input type='date' id='birthday' name='birthday' max={new Date().toISOString().split('T')[0]} required />
                    </label>
                    <br />

                    <button type='submit' name='submitButton'>Finish Profile Setup</button>
                </form>
            </>
        )
    }
};

export default FinishProfile;