import React from 'react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import LoadingSpinner from '../../common/LoadingSpinner';
import LeaderBoardFilter from '../../common/LeaderboardFilter';
import { useAuth } from '../../../context/AuthContext';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Grid';
import ButtonBase from '@mui/material/ButtonBase';
import SongModal from '../../common/SongModal';
const genres = [
    "Pop", "Rap/Hip Hop", "Reggaeton", "Rock", "Dance", "R&B", "Alternative",
    "Christian", "Electro", "Folk", "Reggae", "Jazz", "Country", "Salsa",
    "Traditional Mexicano", "Classical", "Films/Games", "Metal", "Soul & Funk",
    "African Music", "Asian Music", "Blues", "Brazilian Music", "Cumbia",
    "Indian Music", "Kids", "Latin Music"
];

const Leaderboard = () => {
    const [error, setError] = useState(null);
    const [pageLoading, setPageLoading] = useState(false);
    const [listLoading, setListLoading] = useState(true);
    const [trendingSongs, setTrendingSongs] = useState(null);
    const [genreList, setGenreList] = useState([]);
    const [song, setSong] = useState(null);
    const [userProfile, setUserProfile] = useState(null);

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

                console.log(data)


                setTrendingSongs(data);
                setListLoading(false);
            } catch (error) {
                setListLoading(false);
                setError(error);
            }
        }
        getTrendingSongs();
    }, [genreList]);

    useEffect(() => {
        if (!currentUser) return;
        const fetchUserProfile = async () => {
            setPageLoading(true);
            setError(null);
            try {
                const idToken = await currentUser.getIdToken();
                const { data: userProfile } = await axios.get('http://localhost:3000/api/users/profile', {
                    params: {
                        id: currentUser.uid
                    },
                    headers: {
                        'Authorization': `Bearer ${idToken}`
                    }
                });
                if (!userProfile) {
                    setError('User profile not found');
                    setPageLoading(false);
                    return;
                }
                console.log(userProfile)
                setUserProfile(userProfile);
            } catch (error) {
                setError(error);
            }
            setPageLoading(false);
        }
        fetchUserProfile();
    }, []);

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
        <div className="">
            {error && <div>{error}</div>}
            <div className='centertext mt-4'>
                <h1>Top 10 Trending Leaderboard</h1>
            </div>
            <div className='center-leaderboard-filter mt-4 mb-3'>
                <LeaderBoardFilter genres={genres} setGenreList={setGenreList} />
            </div>
            
            <br />

            {listLoading ? <LoadingSpinner /> :
                <div className="center-leaderboard">
                    {trendingSongs && trendingSongs.map((song, index) => (
                        <Stack key={song.id} spacing={2} direction="row" sx={{ marginBottom: 2 }} className='center-leaderboard-item'>
                            <div className='center-leaderboard-rank'>
                                <h1>{`${index + 1}.`}</h1>
                            </div>
                            <ButtonBase 
                            component="div" sx={{ width: '100%' }} onClick={() => handleOpenModal(song)}>
                                <Card sx={{ display: 'flex', minWidth: 800, maxWidth: 800}}>
                                    <CardMedia
                                        component="img"
                                        sx={{ width: 130 }}
                                        image={song.artist.artistImage}
                                        alt={song.artist.artistName}
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
                                                    {song.artist.artistName}
                                                </Typography>
                                            </Grid>
                                            <Grid size={4}>
                                                <Typography
                                                    variant="subtitle1"
                                                    component="div"
                                                    sx={{ color: 'text.secondary' }}
                                                >
                                                    Number of likes: {song.likeCounter}
                                                </Typography>
                                            </Grid>

                                        </Grid>

                                    </CardContent>
                                </Card>
                            </ButtonBase>
                        </Stack>
                    ))}
                    <SongModal
                        song={song}
                        isOpen={song !== null}
                        onClose={handleCloseModal}
                        onLike={addToLikes}
                        userProfile={userProfile}
                    />
                </div>}
        </div>
    );
};

export default Leaderboard;
