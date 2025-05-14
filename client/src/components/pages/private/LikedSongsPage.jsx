import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../../context/AuthContext';
import axios from 'axios';
import LoadingSpinner from '../../common/LoadingSpinner';
import { useNavigate } from 'react-router-dom';
import AudioPlayer from '../../common/AudioPlayer';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import FavoriteIcon from '@mui/icons-material/Favorite';
import Button from '@mui/material/Button';
import SearchIcon from '@mui/icons-material/Search';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import { red } from '@mui/material/colors';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';

const LikedSongsPage = () => {

    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [likedSongs, setLikedSongs] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [refresh, setRefresh] = useState(false);
    const [currentlyPlayingId, setCurrentlyPlayingId] = useState(null);
    const [buttonSemaphore, setButtonSemaphore] = useState(false);


    useEffect(() => {
        const fetchLikedSongs = async () => {
            setLoading(true);
            setError(null);
            setButtonSemaphore(false);
            setLikedSongs([]);


            try {
                console.log(currentUser)

                const idToken = await currentUser.getIdToken();
                const { data } = await axios.get(`http://localhost:3000/api/users/liked-songs/me`, {
                    headers: {
                        'Authorization': `Bearer ${idToken}`
                    }
                });

                if (data.error) {
                    throw 'Error fetching liked songs'
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



    const handleUnlike = async (songId) => {
        if (buttonSemaphore) {
            return;
        }
        setButtonSemaphore(true);
        try {
            // 1. remove the song from the liked songs 
            const idToken = await currentUser.getIdToken();
            console.log(songId, "unlike");
            const { data } = await axios.patch(`http://localhost:3000/api/songs/unlike/`, {
                songId: songId
            }, {
                headers: {
                    'Authorization': `Bearer ${idToken}`
                }
            });
            if (!data.success) {
                throw "failed to unlike the song" + songId;
            }

            // 2. decrment the song count for the leaderboard
            const { data: leaderboardData } = await axios.post(`http://localhost:3000/api/leaderboards/decrement-song-likes`, {
                songId: songId
            }, {
                headers: {
                    'Authorization': `Bearer ${idToken}`
                }
            });
            if (!leaderboardData.success) {
                throw "failed to decrement the song count for the leaderboard" + songId;
            }

            setLikedSongs(likedSongs.filter((song) => song.id !== songId));
            setButtonSemaphore(false);
        } catch (error) {
            setError(error);
            setButtonSemaphore(false);
        }
    };

    const search = likedSongs.filter(song =>
        song.songTitle.toLowerCase().includes(searchQuery.trim().toLowerCase()) ||
        song.artistName.toLowerCase().includes(searchQuery.trim().toLowerCase())
    )

    const getAudioUrl = async (songId) => {
        try {
            const idToken = await currentUser.getIdToken();
            const { data } = await axios.get(`http://localhost:3000/api/songs/get-audio`, {
                params: {
                    songId: songId
                },
                headers: {
                    'Authorization': `Bearer ${idToken}`
                }
            });

            if (!data.previewUrl) {
                throw "No preview URL found";
            }
            return data.previewUrl;
        } catch (error) {
            console.error("Error fetching audio URL:", error);
            return null;
        }
    };

    // if (loading) {
    //     return <div><LoadingSpinner /></div>;
    // }

    if (error) {
        return <div>Error: {error.message}</div>;
    }

    return (
        <>
            <div className="centertext mt-4">
                <h1>Liked Songs</h1>
            </div>
            {loading ? (
                <div className="leaderboard-skeleton mt-2">
                    <Stack spacing={2} sx={{ width: '100%', marginTop: 3 }} className="mt-2 leaderboard-skeleton">
                        <Skeleton variant="text" width={200} height={40} sx={{ marginBottom: 2}} />
                        <Skeleton variant="rounded" width={800} height={130} sx={{ marginBottom: 2 }} />
                        <Skeleton variant="rounded" width={800} height={130} sx={{ marginBottom: 2 }} />
                        <Skeleton variant="rounded" width={800} height={130} sx={{ marginBottom: 2 }} />
                        <Skeleton variant="rounded" width={800} height={130} sx={{ marginBottom: 2 }} />
                    </Stack>
                </div>
            ) :
                <div>

                    {likedSongs.length === 0 ?
                        (
                            <div className="centertext mt-4">
                                <div className='middle mt-5'>
                                    <h5>No liked songs found</h5>
                                    <Button variant="outlined" onClick={() => navigate('/dashboard')} className='mt-3'>Go to Dashboard</Button>
                                </div>
                            </div>

                        ) : (
                            <div className="leaderboard-skeleton mt-2">
                                <Box sx={{ display: 'flex', alignItems: 'flex-end', marginBottom: 2 }}>
                                    <SearchIcon className='search-icon me-2' />

                                    <TextField
                                        id="input-with-sx"
                                        label="Search"
                                        variant="standard"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        sx={{ width: '100%' }}
                                    />
                                </Box>


                                {search.length === 0 ? (<p>No songs match your search.</p>) : (
                                    search.map((song) => (
                                        <Card sx={{ display: 'flex', minWidth: 800, maxWidth: 800, marginBottom: 2 }} key={song.id}>
                                            <CardMedia
                                                component="img"
                                                sx={{ width: 130 }}
                                                image={song.artistImage}
                                                alt={song.artistName}
                                            />

                                            <CardContent sx={{ alignContent: 'center', width: '100%' }} >
                                                <Grid container spacing={2} alignItems="center" >
                                                    <Grid size={4}>
                                                        <Typography
                                                            variant="h6"
                                                            component="div"
                                                            sx={{ color: 'text.primary' }}
                                                        >
                                                            {song.songTitle}
                                                        </Typography>
                                                    </Grid>
                                                    <Grid size={4}>
                                                        <Typography
                                                            variant="subtitle1"
                                                            component="div"
                                                            sx={{ color: 'text.secondary' }}
                                                        >
                                                            {song.artistName}
                                                        </Typography>
                                                    </Grid>
                                                    <Grid size={2}>
                                                        <AudioPlayer
                                                            getUrl={() => getAudioUrl(song.id)}
                                                            songId={song.id}
                                                            currentlyPlayingId={currentlyPlayingId}
                                                            setCurrentlyPlayingId={setCurrentlyPlayingId}
                                                        />
                                                    </Grid>
                                                    <Grid size={2}>

                                                        <Tooltip title="Unlike" placement="top" slotProps={{
                                                            popper: {
                                                                modifiers: [
                                                                    {
                                                                        name: 'offset',
                                                                        options: {
                                                                            offset: [0, -14],
                                                                        },
                                                                    },
                                                                ],
                                                            },
                                                        }}>
                                                            <IconButton onClick={() => handleUnlike(song.id)} aria-label="unlike" size="large">
                                                                <FavoriteIcon fontSize="large" sx={{ color: red[300] }} />
                                                            </IconButton>
                                                        </Tooltip>

                                                    </Grid>
                                                </Grid>

                                            </CardContent>
                                        </Card>

                                    )
                                    ))}
                            </div>
                        )
                    }
                </div>
            }
        </>

    );
};

export default LikedSongsPage;