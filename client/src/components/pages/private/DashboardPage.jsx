import React, { useState, useEffect } from "react";
import LoadingSpinner from "../../common/LoadingSpinner";
import { useAuth } from "../../../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";
import Dropdown from "react-bootstrap/Dropdown";
import Switch from '@mui/material/Switch';
import axios from "axios";
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import IconButton from '@mui/material/IconButton';
import FavoriteIcon from '@mui/icons-material/Favorite';
import CloseIcon from '@mui/icons-material/Close';
import Grid from '@mui/material/Grid';


const DashboardPage = () => {
    const { currentUser } = useAuth();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [swipeSongs, setSwipeSongs] = useState(null);
    const [index, setIndex] = useState(null);
    const [refresh, setRefresh] = useState(false);


    const [dissableDislike, setDissableDislike] = useState(false);
    const [dissableLike, setDissableLike] = useState(false);



    useEffect(() => {
        const sendDailyRecs = async () => {
            setLoading(true);
            try {
                if (!currentUser) {
                    setError("User not found");
                    return;
                }

                const idToken = await currentUser.getIdToken();
                await axios.post(`http://localhost:3000/api/users/login-recommendations`, {}, {
                    headers: {
                        'Authorization': `Bearer ${idToken}`
                    }
                });
            } catch (error) {
                setLoading(false);
                setError(error);
            }
        }
        setLoading(false);
        sendDailyRecs();
        const fetchData = async () => {
            setLoading(true);
            setError(null);

            try {
                if (!currentUser) {
                    setError("User not found");
                    return;
                }

                const idToken = await currentUser.getIdToken();
                const { data } = await axios.get(`http://localhost:3000/api/users/swipe-songs`, {
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
        if (dissableDislike) {
            return;
        }
        setDissableDislike(true);

        if (index >= swipeSongs.length - 1) {
            setRefresh(!refresh);
            setDissableDislike(false);
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
            setDissableDislike(false);
        } catch (error) {
            setError(error);
        }
    };

    const handleLikeButton = async () => {

        if (dissableLike) {
            return;
        }

        setDissableLike(true);

        if (index >= swipeSongs.length - 1) {
            setRefresh(!refresh);
            setDissableLike(false);
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
            setDissableLike(false);
        } catch (error) {
            setError(error);
        }
    };

    //https://www.geeksforgeeks.org/how-to-use-addeventlistener-in-react/
    useEffect(() => {
        
        const handleKeyDown = (event) => {
            if (event.key === 'ArrowLeft') {
                handleDislikeButton();
            } else if (event.key === 'ArrowRight') {
                handleLikeButton();
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [index, handleDislikeButton, handleLikeButton]);


    if (loading) {
        return <LoadingSpinner />
    }

    if (error) {
        return <div>{error}</div>
    }

    return (
        <>
            <div className="centeritems">
                {swipeSongs && swipeSongs.length > 0 && index !== null && index < swipeSongs.length && (
                    <Card sx={{ maxWidth: 350 }} className="dashsong">
                        <CardMedia
                            component="img"
                            height="350"
                            image={swipeSongs[index].artist_pfp}
                            alt={`${swipeSongs[index].artist_name} image`}
                        />
                        <CardContent>
                            <div>
                                <h3>{swipeSongs[index].song_name}</h3>

                                <audio
                                    controls
                                    src={swipeSongs[index].preview_url}
                                    style={{ width: '100%', marginTop: '10px' }}
                                >
                                    Your browser does not support the audio element.
                                </audio>
                                <Grid container spacing={2} >
                                    <Grid size={6} className="centertext">

                                        <IconButton onClick={handleDislikeButton} aria-label="dislike" size="large">
                                            <CloseIcon fontSize="large" />
                                        </IconButton>

                                    </Grid>
                                    <Grid size={6} className="centertext">

                                        <IconButton onClick={handleLikeButton} aria-label="like" color="success.light" size="large">
                                            <FavoriteIcon fontSize="large" />
                                        </IconButton>

                                    </Grid>
                                </Grid>
                            </div>
                        </CardContent>

                    </Card>
                )}
            </div>
        </>
    )   
}


export default DashboardPage;