import React, {useContext} from 'react';
import { doSocialSignIn } from '../../firebase/FirebaseFunctions';
import axios from 'axios';
import { deleteUser, getIdToken } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

const SocialSignIn = () => {
    const navigate = useNavigate();

    const socialSignOn = async () => {
        let user;
        try {
            user = await doSocialSignIn();
        } catch (error) {
            alert(error);
        }

        // checks to see if the user is not over age
        try {
            // 1. need to check if user has finished setting up profile
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
            navigate('/dashboard');
        } catch(e) {
            console.log(e.message)
            setError(e.message);
        }  
    }

    return (
        <div>
            <img onClick={() => socialSignOn()} 
            src='https://developers.google.com/identity/images/btn_google_signin_dark_normal_web.png' 
            alt='google signin' />
        </div>
    )


}

export default SocialSignIn;