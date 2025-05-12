import React from 'react';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Fade from '@mui/material/Fade';
import Backdrop from '@mui/material/Backdrop';
import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../../common/LoadingSpinner';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderOutlinedIcon from '@mui/icons-material/FavoriteBorderOutlined';
import Tooltip from '@mui/material/Tooltip';

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: "33rem",
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
    display: 'flex',
    flexDirection: 'column',
};

const SongModal = ({ song, isOpen, onClose, onLike, userProfile }) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [hasSeen, setHasSeen] = useState(false);
    const [haveLiked, setHaveLiked] = useState(false);
    const [audioUrl, setAudioUrl] = useState(null);
    const navigate = useNavigate();
    const { currentUser } = useAuth();


    const [buttonDisabled, setButtonDisabled] = useState(false);


    useEffect(() => {
        const fetchUserSongHistory = async () => {
            if (!song || !currentUser) return;

            setLoading(true);
            setError(null);
            setAudioUrl(null);

            try {
                const idToken = await currentUser.getIdToken();
                // 1. First api call is to check if the user has already liked the song
                const { data: haveSeenResponse } = await axios.get('http://localhost:3000/api/leaderboards/has-seen-song', {
                    params: {
                        songId: song.id
                    },
                    headers: {
                        'Authorization': `Bearer ${idToken}`
                    }
                });
                if (!haveSeenResponse.success) {
                    throw new Error("Error fetching song data");
                }
                console.log(haveSeenResponse.haveSeen);
                setHasSeen(haveSeenResponse.haveSeen);
                // if the user has seen the song populate the haveLiked state with if they liked the song
                if (haveSeenResponse.haveSeen) {
                    setHaveLiked(haveSeenResponse.haveLiked);
                }

                // 2. Second api call is to get the audio of the song 
                const { data: audioResponse } = await axios.get('http://localhost:3000/api/songs/get-audio', {
                    params: {
                        songId: song.id
                    },
                    headers: {
                        'Authorization': `Bearer ${idToken}`
                    }
                });

                console.log(audioResponse);

                if (!audioResponse || !audioResponse.previewUrl) {
                    throw new Error("Error fetching audio data");
                }

                setAudioUrl(audioResponse.previewUrl);

                setLoading(false);
            } catch (error) {
                console.error('Error fetching song data:', error);
                setError(error);
                setLoading(false);
            }
        };

        fetchUserSongHistory();
    }, [song, currentUser]);

    if (!song || !userProfile) {
        return null;
    }

    if (!userProfile.explicitData && song.explicitFlag) {
        return (
            <Modal
                open={isOpen}
                onClose={onClose}
                aria-labelledby="explicit-content-modal"
            >
                <Box sx={style}>
                    <Typography variant="h6" component="h2">
                        Content Not Available
                    </Typography>
                    <Typography sx={{ mt: 2 }}>
                        You are not allowed to view this content due to explicit content settings.
                    </Typography>
                    <button
                        onClick={() => navigate('/settings')}
                        style={{ marginTop: '1rem' }}
                    >
                        Go to settings to change your explicit content preferences
                    </button>
                </Box>
            </Modal>
        );
    }

    if (error) return <div>Error: {error.message}</div>;
    if (loading) return <div>Loading...</div>;


    const handleNotSeenSongLike = async () => {
        if (buttonDisabled) return;

        setButtonDisabled(true);

        try {
            // 1. First api call is to add the song to the user's seen songs
            const idToken = await currentUser.getIdToken();
            const { data: likeResponse } = await axios.post('http://localhost:3000/api/leaderboards/add-seen-song', {
                songId: song.id,
                liked: true
            }, {
                headers: {
                    'Authorization': `Bearer ${idToken}`
                }
            });
            if (!likeResponse.success) {
                throw new Error("Error adding seen song");
            }
            // 2. to increment the song's like counter
            const { data: incrementResponse } = await axios.post('http://localhost:3000/api/leaderboards/increment-song-likes', {
                songId: song.id
            }, {
                headers: {
                    'Authorization': `Bearer ${idToken}`
                }
            });
            if (!incrementResponse.success) {
                throw new Error("Error incrementing song likes");
            }
            setHasSeen(true);
            setHaveLiked(true);
            setButtonDisabled(false);
        } catch (error) {
            alert("Error adding seen song");
            setButtonDisabled(false);
        }
    }
    const handleSeenSongLike = async () => {
        if (buttonDisabled) return;

        setButtonDisabled(true);

        try {
            // 1. First api call is to add the song to the user's seen songs
            const idToken = await currentUser.getIdToken();
            const { data: likeResponse } = await axios.patch('http://localhost:3000/api/songs/add-liked-seen-song', {
                songId: song.id,
            }, {
                headers: {
                    'Authorization': `Bearer ${idToken}`
                }
            });
            if (!likeResponse.success) {
                throw new Error("Error adding seen song");
            }
            // 2. to increment the song's like counter
            const { data: incrementResponse } = await axios.post('http://localhost:3000/api/leaderboards/increment-song-likes', {
                songId: song.id
            }, {
                headers: {
                    'Authorization': `Bearer ${idToken}`
                }
            });
            if (!incrementResponse.success) {
                throw new Error("Error incrementing song likes");
            }
            setHasSeen(true);
            setHaveLiked(true);
            setButtonDisabled(false);
        } catch (error) {
            alert("Error adding seen song");
            setButtonDisabled(false);
        }
    }
    const handleLikedSongUnlike = async () => {
        if (buttonDisabled) return;

        setButtonDisabled(true);

        try {
            // 1. First api call is to remove the song from the user's seen songs
            const idToken = await currentUser.getIdToken();
            const { data: likeResponse } = await axios.patch('http://localhost:3000/api/songs/unlike', {
                songId: song.id,
            }, {
                headers: {
                    'Authorization': `Bearer ${idToken}`
                }
            });
            if (!likeResponse.success) {
                throw new Error("Error removing liked song");
            }
            // 2. to decrement the song's like counter
            const { data: decrementResponse } = await axios.post('http://localhost:3000/api/leaderboards/decrement-song-likes', {
                songId: song.id
            }, {
                headers: {
                    'Authorization': `Bearer ${idToken}`
                }
            });
            if (!decrementResponse.success) {
                throw new Error("Error decrementing song likes");
            }
            setHasSeen(true);
            setHaveLiked(false);
            setButtonDisabled(false);
        } catch (error) {
            alert("Error removing liked song");
            setButtonDisabled(false);
        }
    }

    return (
        <Modal
            open={isOpen}
            onClose={onClose}
            aria-labelledby="song-modal-title"
            aria-describedby="song-modal-description"
            closeAfterTransition
            slots={{ backdrop: Backdrop }}
            slotProps={{
                backdrop: {
                    timeout: 500,
                },
            }}
        >
            <Fade in={isOpen}>
                <Box sx={style}>
                    <Typography id="modal-modal-title" variant="h5" component="h2">
                        {song.songTitle}
                    </Typography>
                    <Typography id="modal-modal-description" sx={{ mt: 1 }}>
                        {song.artist.artistName}
                    </Typography>

                    <img
                        src={song.artist.artistImage}
                        alt={song.artist.artistName}
                        style={{ maxWidth: '100%', height: 'auto', marginTop: '1rem' }}
                    />
                    <Stack direction="row" spacing={2} sx={{ marginTop: '1.3rem' }} alignItems={'center'} justifyContent="center">
                        {!audioUrl && (
                            <div style={{ width: '100%', marginTop: '1rem', display: 'flex', justifyContent: 'center' }}>
                                <div style={{ width: '50px', height: '50px' }}>
                                    Loading Audio...
                                </div>
                            </div>
                        )}
                        {audioUrl && (
                            <audio
                                src={audioUrl}
                                controls
                                style={{ width: '100%' }}
                            />
                        )}

                        {!hasSeen && (
                            // <button onClick={handleNotSeenSongLike}>Add to your likes</button>
                            <Tooltip title="Add to your likes"  placement="top" slotProps={{
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
                                <IconButton onClick={handleNotSeenSongLike} aria-label="like" size="large">
                                    <FavoriteBorderOutlinedIcon fontSize="large" />
                                </IconButton>
                            </Tooltip>
                        )}
                        {hasSeen && !haveLiked && (
                            // <button onClick={handleSeenSongLike}>Add to your likes</button>
                            <Tooltip title="Add to your likes" placement="top" slotProps={{
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
                                <IconButton onClick={handleSeenSongLike} aria-label="like" size="large">
                                    <FavoriteBorderOutlinedIcon fontSize="large" />
                                </IconButton>
                            </Tooltip>
                        )}
                        {hasSeen && haveLiked && (
                            // <button onClick={handleLikedSongUnlike}>Remove from your likes</button>
                            <Tooltip title="Remove from your likes" placement="top" slotProps={{
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
                                <IconButton onClick={handleLikedSongUnlike} aria-label="like" size="large">
                                    <FavoriteIcon fontSize="large" />
                                </IconButton>
                            </Tooltip>
                        )}
                    </Stack>
                </Box>
            </Fade>
        </Modal>
    );
};

export default SongModal;







