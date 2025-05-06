import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import axios from "axios";
import LoadingSpinner from "../../common/LoadingSpinner";

const ProfilePage = () => {
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const { currentUser } = useAuth();

    useEffect(() => {
        const getProfileData = async () => {
            try {
                if (!currentUser) {
                    navigate('/');
                    return;
                }

                const idToken = await currentUser.getIdToken();
                const { data } = await axios.get('http://localhost:3000/api/users/profile', {
                    headers: {
                        'Authorization': `Bearer ${idToken}`,
                        'Content-Type': 'application/json'
                    }
                });

                setUserData(data);
                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };

        getProfileData();
    }, [currentUser ])

    if (loading) return  <div><LoadingSpinner /></div>
    if (error) return <div>Error: {error}</div>;

    return (
        <>
            {userData && (
                <div>
                    <h1>Profile Page</h1>
                    <pre>{JSON.stringify(userData, null, 2)}</pre>
                </div>
            )}
        </>
    )
};

export default ProfilePage; 