import React, { useState, useEffect } from "react";
import LoadingSpinner from "../../common/LoadingSpinner";
import { useAuth } from "../../../context/AuthContext.jsx";
import Button from '@mui/material/Button';
import axios from "axios";
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import IconButton from '@mui/material/IconButton';
import FavoriteIcon from '@mui/icons-material/Favorite';
import CloseIcon from '@mui/icons-material/Close';
import Grid from '@mui/material/Grid';
import { red, blue, grey } from '@mui/material/colors';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';


const DashboardPage = () => {
    const { currentUser } = useAuth();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [swipeSongs, setSwipeSongs] = useState(null);
    const [index, setIndex] = useState(null);
    const [refresh, setRefresh] = useState(false);


    const [disabledButtons, setDisabledButtons] = useState(false);
    // const [dissableDislike, setDissableDislike] = useState(false);
    // const [dissableLike, setDissableLike] = useState(false);



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
        if (disabledButtons) {
            return;
        }
        setDisabledButtons(true);

        // if (index >= swipeSongs.length - 1) {
        //     setRefresh(!refresh);
        //     setDissableDislike(false);
        //     return;
        // }

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
            if (index >= swipeSongs.length - 1) {
                setRefresh(!refresh);
                setDisabledButtons(false);
                return;
            }
            setDisabledButtons(false);
        } catch (error) {
            setError(error);
            setDisabledButtons(false);
        }
    };

    const handleLikeButton = async () => {
        if (disabledButtons) {
            return;
        }

        setDisabledButtons(true);

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
                throw new Error(response.data.error || 'Failed to like song');
            }

            const { data } = await axios.post('http://localhost:3000/api/songs/seen', {
                songId: swipeSongs[index].song_id,
                liked: true
            }, {
                headers: {
                    'Authorization': `Bearer ${idToken}`
                }
            });

            if (data.needToRefresh) {
                setRefresh(!refresh);
            }


            if (data.success) {
                setIndex(index + 1);
            } else {
                setError(data.error || 'Failed to mark song as seen');
            }

            if (index >= swipeSongs.length - 1) {
                setRefresh(!refresh);
                setDisabledButtons(false);
                return;
            }

            setDisabledButtons(false);
        } catch (error) {
            setError(error.response?.data?.message || error.message || 'An error occurred while processing your request');
            setDisabledButtons(false);
        }
    };

    //https://www.geeksforgeeks.org/how-to-use-addeventlistener-in-react/
    useEffect(() => {
        if (loading) return;

        let like = false;
        let dislike = false;

        const handleKeyDown = (event) => {
            if (event.key === 'ArrowLeft') {
                if (like) {
                    return;
                }
                dislike = true;
                handleDislikeButton();
            }
            if (event.key === 'ArrowRight') {
                if (dislike) {
                    return;
                }
                like = true;
                handleLikeButton();
            }
        };

        const handleKeyUp = (event) => {
            if (event.key === 'ArrowLeft') dislike = false;
            if (event.key === 'ArrowRight') like = false;
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, [index, handleDislikeButton, handleLikeButton]);




    const handleAudioRefresh = async () => {
        try {
            const idToken = await currentUser.getIdToken();
            const { data } = await axios.get(`http://localhost:3000/api/songs/get-audio`, {
                params: {
                    songId: swipeSongs[index].song_id
                },
                headers: {
                    'Authorization': `Bearer ${idToken}`
                }
            });

            if (data.previewUrl) {
                setSwipeSongs(prevSongs =>
                    prevSongs.map(song =>
                        song.song_id === swipeSongs[index].song_id
                            ? { ...song, preview_url: data.previewUrl }
                            : song
                    )
                );
            }
        } catch (error) {
            console.error("Error refreshing audio URL:", error);
        }
    };



    if (loading) {
        return (
            <div className="centeritems">
                <Stack sx={{ display: 'flex', alignItems: 'center' }} spacing={1}>
                    <Skeleton variant="rectangular" width={350} height={600} sx={{ marginTop: 2 }} />
                </Stack>
            </div>
        )
    }

    if (error) {
        return (
            <div className="centeritems">
                <div style={{ color: 'red', padding: '20px' }}>
                    {typeof error === 'string' ? error : 'An unexpected error occurred'}
                </div>
                <Button variant="contained" onClick={() => setRefresh(!refresh)}>Try Again</Button>
            </div>
        );
    }


    if (swipeSongs.length === 0) {
        return (
            <>
                <div>No songs found</div>
                <Button variant="contained" onClick={() => setRefresh(!refresh)}>Refresh</Button>
            </>
        )
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
                                <h4>{swipeSongs[index].artist_name}</h4>

                                {swipeSongs[index].preview_url ? (
                                    <div>
                                        <audio
                                            controls
                                            src={swipeSongs[index].preview_url}
                                            style={{ width: '100%', marginTop: '10px' }}
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                                e.target.nextElementSibling.style.display = 'flex';
                                                handleAudioRefresh();
                                            }}
                                        >
                                            Your browser does not support the audio element.
                                        </audio>
                                        <div style={{
                                            display: 'none',
                                            width: '100%',
                                            marginTop: '10px',
                                            padding: '10px',
                                            backgroundColor: '#f5f5f5',
                                            borderRadius: '4px',
                                            textAlign: 'center',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            gap: '10px'
                                        }}>
                                            <div>Audio preview is no longer available</div>
                                            <Button
                                                variant="contained"
                                                size="small"
                                                onClick={handleAudioRefresh}

                                            >
                                                Refresh Song
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div style={{
                                        width: '100%',
                                        marginTop: '10px',
                                        padding: '10px',
                                        backgroundColor: '#f5f5f5',
                                        borderRadius: '4px',
                                        textAlign: 'center'
                                    }}>
                                        No audio preview available for this song
                                    </div>
                                )}
                                <Grid container spacing={1} display={"flex"} marginTop={2} >
                                    <Grid size={6} className="centertext">
                                        <Button onClick={handleDislikeButton} aria-label="dislike" variant="outlined" sx={{ width: "100%", height: "100%", borderColor: grey[300]}} >
                                            <CloseIcon fontSize="large" sx={{ color: blue[300] }} />
                                        </Button>

                                        {/* <IconButton onClick={handleDislikeButton} aria-label="dislike" size="large">
                                            <CloseIcon fontSize="large" sx={{ color: blue[300] }} />
                                        </IconButton> */}

                                    </Grid>
                                    <Grid size={6} className="centertext">

                                        {/* <IconButton onClick={handleLikeButton} aria-label="like" color="success.light" size="large">
                                            <FavoriteIcon fontSize="large" sx={{ color: red[300] }} />
                                        </IconButton> */}
                                        <Button onClick={handleLikeButton} aria-label="like" variant="outlined" sx={{ width: "100%", height: "100%", borderColor: grey[300] }} >
                                            <FavoriteIcon fontSize="large" sx={{ color: red[300] }} />
                                        </Button>

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