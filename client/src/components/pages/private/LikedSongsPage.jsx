import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import axios from 'axios';
import LoadingSpinner from '../../common/LoadingSpinner';


const LikedSongsPage = () => {

    const { currentUser } = useAuth();

    const [likedSongs, setLikedSongs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [refresh, setRefresh] = useState(false);


    useEffect(() => {
        const fetchLikedSongs = async () => {

            try {
                console.log(currentUser)

                const idToken = await currentUser.getIdToken();
                const { data } = await axios.get(`http://localhost:3000/api/users/liked-songs/${currentUser.uid}`, {
                    headers: {
                        'Authorization': `Bearer ${idToken}`
                    }
                });

                if (data.error) {
                    throw new Error(data.error);
                }

                setLikedSongs(data);
                setLoading(false);
            } catch (error) {
                setLoading(false);
                setError(error);
            } 
        };

        fetchLikedSongs();
    }, [refresh]);


    if (loading) {
        return <div><LoadingSpinner /></div>;
    }
    if (error) {
        return <div>Error: {error.message}</div>;
    }
    if (likedSongs.length === 0) {
        return <div>No liked songs found</div>;
    }

    const handleUnlike = async (songId) => {
        try {
            const token = user.token;
            const { data } = await axios.delete(`/api/liked-songs/${user.id}/${songId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (data.error) {
                throw new Error(data.error);
            }

            setRefresh(!refresh);
        } catch (error) {
            setError(error);
        }
    };

    return (
        <>
            <h1>Liked Songs</h1>
            {likedSongs.map((song) => (
                <div key={song.id}>
                    <h2>{song.title}</h2>
                    <p>{song.artist}</p>
                    <button onClick={() => handleUnlike(song.id)}>Unlike</button>
                </div>
            ))}
        </>
    );
};  

export default LikedSongsPage;