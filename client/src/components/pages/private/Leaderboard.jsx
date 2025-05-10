import React from 'react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import LoadingSpinner from '../../common/LoadingSpinner';
import LeaderBoardFilter from '../../common/LeaderboardFilter';
import { useAuth } from '../../../context/AuthContext';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Stack from '@mui/material/Stack';
import Fade from '@mui/material/Fade';
import Backdrop from '@mui/material/Backdrop';

//for modal
const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 700,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
};

// should be replaced with the genres from the database
const genres = [
    "Pop",
    "Rap/Hip Hop",
    "Reggaeton",
    "Rock",
    "Dance",
    "R&B",
    "Alternative",
    "Christian",
    "Electro",
    "Folk",
    "Reggae",
    "Jazz",
    "Country",
    "Salsa",
    "Traditional Mexicano",
    "Classical",
    "Films/Games",
    "Metal",
    "Soul & Funk",
    "African Music",
    "Asian Music",
    "Blues",
    "Brazilian Music",
    "Cumbia",
    "Indian Music",
    "Kids",
    "Latin Music"
]

const Leaderboard = () => {

    const [error, setError] = useState(null);
    //this will be used when we import the genres or any filter parameters from the database, for now set to false 
    const [pageLoading, setPageLoading] = useState(false);
    //this is for list refreshes when we add filter
    const [listLoading, setListLoading] = useState(true);
    const [trendingSongs, setTrendingSongs] = useState(null);
    const [genreList, setGenreList] = useState([]);
    //used for modal
    const [song, setSong] = useState(null);

    const { currentUser } = useAuth();
    useEffect(() => {
        setListLoading(true);
        const getTrendingSongs = async () => {
            try {
                const { data } = await axios.post('http://localhost:3000/api/songs/trending', {
                    filters: {
                        genres: genreList,
                    },
                }, {
                    headers: {
                        'Authorization': `Bearer ${currentUser.accessToken}`
                    }

                });


                for (const song of data) {
                    try {
                        const { data } = await axios.post('http://localhost:3000/api/songs/song/alreadyLiked', {
                            songId: song.id
                        }, {
                            headers: {
                                'Authorization': `Bearer ${currentUser.accessToken}`
                            }
                        });
                        song.alreadyLiked = data.alreadyLiked;
                    } catch (error) {
                        console.log(error);
                    }
                }

                setTrendingSongs(data);
                setListLoading(false);
            } catch (error) {
                setListLoading(false);
                setError(error);
            }
        }
        getTrendingSongs();
    }, [genreList]);


    const addToLikes = async (songId) => {
        try {
            const { data } = await axios.post('http://localhost:3000/api/songs/like', {
                songId: songId
            }, {
                headers: {
                    'Authorization': `Bearer ${currentUser.accessToken}`
                }
            });
            console.log(data);
        } catch (error) {
            setError(error);
            console.log(error);
        }
    }

    const handleOpenModal = (song) => {
        setSong(song);
    };

    const handleCloseModal = () => {
        setSong(null);
    };

    if (error) return <div>{error}</div>;
    if (pageLoading) return <div><LoadingSpinner /></div>;

    return (
        <div>
            {error && <div>{error}</div>}
            <div>
                <h1>Trending Leaderboard</h1>
            </div>
            {/* component for song filtering menu found in common folder */}
            <LeaderBoardFilter genres={genres} setGenreList={setGenreList} />
            <br />

            {listLoading ? <LoadingSpinner /> :
                <div>
                    {trendingSongs && trendingSongs.map((song, index) => (
                        <Stack key={song.id} spacing={2} direction="row">
                            <h1>{`${index + 1}.`}</h1>
                            <Card sx={{ display: 'flex' }}>
                                <CardMedia
                                    component="img"
                                    sx={{ width: 130 }}
                                    image={song.artist.artistImage}
                                    alt={song.artist.artistName}
                                />
                                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                    <CardContent sx={{ flex: '1 0 auto' }}>
                                        <Button onClick={() => handleOpenModal(song)}>{song.songTitle}</Button>
                                        <Typography
                                            variant="subtitle1"
                                            component="div"
                                            sx={{ color: 'text.secondary' }}
                                        >
                                            {song.artist.artistName}
                                        </Typography>
                                    </CardContent>
                                </Box>
                            </Card>
                        </Stack>

                    ))}
                    {/* #TODO: modal component needs work */}
                    <Modal
                        open={song !== null}
                        onClose={handleCloseModal}
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
                        <Fade in={song !== null}>
                            <Box sx={style}>
                                {song && (
                                    <>
                                        <Typography id="modal-modal-title" variant="h6" component="h2">
                                            {song.songTitle}
                                        </Typography>
                                        <img src={song.artist.artistImage} alt={song.artist.artistName} />
                                        <Typography id="modal-modal-description" sx={{ mt: 2 }}>

                                            {song.artist.artistName}

                                        </Typography>
                                        <audio src={song.songPreview} controls />
                                        {song.alreadyLiked ? <button>Already liked</button> : <button onClick={() => addToLikes(song.id)}>Add to your likes</button>}
                                    </>
                                )}

                            </Box>
                        </Fade>
                    </Modal>
                </div>}
        </div>

    );
};

export default Leaderboard;
