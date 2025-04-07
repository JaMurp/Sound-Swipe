import React, {useContext, useState} from 'react';
import {AuthContext} from '../../context/AuthContext';
import {doSignInWithEmailAndPassword, doPasswordReset} from '../../firebase/FirebaseFunctions';
import {Navigate} from 'react-router-dom';
import SocialSignIn from './SocialSignIn';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { deleteUser, getIdToken } from 'firebase/auth';


const Login = ({ onSuccess, onSignUpClick }) => {
    const [open, setOpen] = useState(false);
    const [error, setError] = useState(null);

    const handleOpen = () => {
        onSignUpClick();
    };
    const handleClose = () => setOpen(false);

    const {currentUser} = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        let userCredentials;
        let user;
        let {email, password} = e.target.elements;
        setError(null);
        try {
            userCredentials = await doSignInWithEmailAndPassword(email.value, password.value);
            //onSuccess?.();
            //navigate('/dashboard');
        } catch (error) {
            setError(error.message.replace('Firebase: ', ''));
            return 
        }

        // checks to see if user is now over age 
        try {
            // 1. need to check if user has finished setting up profile
            user = userCredentials.user;
            const resProfileFinished = await axios.get(`http://localhost:3000/api/users/find/${user.uid}`);

            if (!resProfileFinished.data.success) {
                onSuccess?.();
                navigate('/dashboard');
                return;
            }

            // 2. need to recalc
            const idToken = await user.getIdToken();
            const res = await axios.post('http://localhost:3000/api/users/check-age', {},{
                    headers: {
                        Authorization: `Bearer ${idToken}`
                    }
                });

            if (!res.data.success) {
                throw "Error"
            }
            // 3. enable them to login
            onSuccess?.();
            navigate('/dashboard');
        } catch(e) {
            console.log(e.message)
            setError(e.message);
        }
    };
    const passwordReset = (event) => {
        event.preventDefault();
        let email = document.getElementById('email').value;
        setError(null);
        
        if (email) {
            doPasswordReset(email);
            alert('Password reset email sent');
        } else {
            setError('Please enter an email');
        }
    }

    if (currentUser) {
        return <Navigate to='/dashboard' />
    }

    return (
        <div>
            <h1>Login</h1>
            {error && <div className="error-message">{error}</div>}
            <form className='login-form' onSubmit={handleLogin}>
                <label htmlFor='email'>Email
                    <br />
                    <input type='email' name='email' placeholder='Email' />
                </label>
                <br />
                <label htmlFor='password'>Password
                    <br />
                    <input type='password' name='password' placeholder='Password' />
                </label>
                <br />
                <button type='submit'>Login</button>
            </form>
            <br />

            <button onClick={passwordReset}>Reset Password</button>

            <br />
            <SocialSignIn />
            <br />

            <p>Don't have an account? 
                <button onClick={handleOpen}>Sign up</button>
                {/* <SignUpModal open={open} onClose={handleClose} /> */}
            </p>
        </div>
    )
};

export default Login;