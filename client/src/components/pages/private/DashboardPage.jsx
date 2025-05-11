import React, { useState, useEffect } from "react";
import LoadingSpinner from "../../common/LoadingSpinner";
import { useAuth } from "../../../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";
import Dropdown from "react-bootstrap/Dropdown";
import Switch from '@mui/material/Switch';
import axios from "axios";

const DashboardPage = () => {
    const { currentUser } = useAuth();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [swipeSongs, setSwipeSongs] = useState(null);
    const [index, setIndex] = useState(null);
    const [refresh, setRefresh] = useState(false);



    useEffect(() => {

        const fetchData = async () => {
            setLoading(true);
            setError(null);

            try {
                if (!currentUser) {
                    setError("User not found");
                    return;
                }

                const idToken = await currentUser.getIdToken();
                const {data} = await axios.get(`http://localhost:3000/api/users/swipe-songs`, {
                    headers: {
                        'Authorization': `Bearer ${idToken}`
                    }
                });

                if (!data) {
                    setError("No songs found");
                    return;
                }

                setSwipeSongs(data.songs);
                setIndex(data.index);
            } catch (error) {

                setError(error);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [refresh])

    const handleDislikeButton = async () => {
        if (index >= swipeSongs.length - 1) {
            setRefresh(!refresh);
            return;
        }
        try {
            const idToken = await currentUser.getIdToken();
            const { data } = await axios.post('http://localhost:3000/api/songs/seen', {
                songId: swipeSongs[index].song_id,
                liked: false
            }, {
                headers: {
                    'Authorization': `Bearer ${idToken}`
                }
            });
            if (data.success) {
                setIndex(index + 1);
            } else {
                setError(data.error);
            }
        } catch (error) {
            setError(error);
        }
    };

    const handleLikeButton = async () => {
        if (index >= swipeSongs.length - 1) {
            setRefresh(!refresh);
            return;
        }
        try {
            const idToken = await currentUser.getIdToken();


            const response = await axios.post('http://localhost:3000/api/songs/like', {
                songId: swipeSongs[index].song_id,
            }, {
                headers: {
                    'Authorization': `Bearer ${idToken}`
                }
            });

            if (!response.data.success) {
                throw new Error(response.data.error);
            }

            const { data } = await axios.post('http://localhost:3000/api/songs/seen', {
                songId: swipeSongs[index].song_id,
                liked: true
            }, {
                headers: {
                    'Authorization': `Bearer ${idToken}`
                }
            });
            if (data.success) {
                setIndex(index + 1);
            } else {
                setError(data.error);
            }
        } catch (error) {
            setError(error);
        }
    };


    if (loading) {
        return <LoadingSpinner />
    }

    if (error) {
        return <div>{error}</div>
    }

    return (
        <>
            <div>
                <div>
                    <h1>Swipe Songs</h1>
                </div>
                <div>
                    {swipeSongs && swipeSongs.length > 0 && index !== null && index < swipeSongs.length && (
                        <div>
                            <h3>{swipeSongs[index].song_name}</h3>
                            <img
                                src={swipeSongs[index].artist_pfp}
                                alt={`${swipeSongs[index].artist_name} image`}
                                style={{ width: '200px', height: '200px', objectFit: 'cover' }}
                            />
                            <audio
                                controls
                                src={swipeSongs[index].preview_url}
                                style={{ width: '100%', marginTop: '10px' }}
                            >
                                Your browser does not support the audio element.
                            </audio>
                        </div>
                    )}

                    <button onClick={handleDislikeButton}>Dislike</button>
                    <button onClick={handleLikeButton}>Like</button>
                </div>
            </div>
        </>
    )


}


export default DashboardPage;