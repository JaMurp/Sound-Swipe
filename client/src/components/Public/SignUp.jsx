import React, {useState, useContext} from 'react';
import {AuthContext} from '../../context/AuthContext';
import {doCreateUserWithEmailAndPassword } from '../../firebase/FirebaseFunctions';
import {Navigate, useNavigate} from 'react-router-dom';
import SocialSignIn from './SocialSignIn.jsx';
import * as authHelpers from '../../helpers/authHelper.js'
import axios from 'axios';

import { getAuth, deleteUser, getIdToken } from 'firebase/auth';


const SignUp = ({ onSuccess }) => {
    const {currentUser} = useContext(AuthContext);

    //added 
    const {setUserData} = useContext(AuthContext);
    const navigate = useNavigate();

    const [passwordMatch, setPasswordMatch] = useState(null);
    const [error, setError] = useState(null);

    // global vars
    //let isOver18;

    const handleSignUp= async (e) => {
        e.preventDefault();

        // add birthday if needed 
        const {displayName, email, password, passwordConfirm } = e.target.elements;

        
        // check if passwords match
        if (password.value !== passwordConfirm.value) {
            setPasswordMatch('Passwords do not match');
            return false;
        } else {
            setPasswordMatch(null);
        }


        // new implementaion
        try {
            await doCreateUserWithEmailAndPassword(
                email.value,
                password.value,
                displayName.value
            );

            onSuccess?.();

        } catch(e) {
            alert("Error with signup");
        }
        
    };
    
    if (currentUser) {
        return <Navigate to='/dashboard' />;
    } else {
        return (
            <div>
                <h1>Sign Up</h1>
                {(passwordMatch || error) && <h3>{passwordMatch || error}</h3>}
                <form className='signup-form' onSubmit={handleSignUp}>
                    <label htmlFor='displayName'>Username
                        <br />
                        <input type='text' name='displayName' placeholder='Username' required/>
                    </label>

                    <label htmlFor='email'>Email
                        <br />
                        <input type='email' name='email' placeholder='Email' required/>
                    </label>

                    <label htmlFor='password'>Password
                        <br />
                        <input type='password' name='password' placeholder='Password' required/>
                    </label>

                    <label htmlFor='passwordConfirm'>Confirm Password
                        <br />
                        <input type='password' name='passwordConfirm' placeholder='Confirm Password' required/>
                    </label>

                    
                    <button type='submit' name='submitButton'>Sign Up</button>
                </form>
                <br />
                <SocialSignIn />
                <br />

            </div>
        );
    }

}   

export default SignUp;