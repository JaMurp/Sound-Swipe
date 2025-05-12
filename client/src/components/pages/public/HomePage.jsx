import React from "react";
import { useState, useEffect } from "react";
import LoadingSpinner from "../../common/LoadingSpinner";
import axios from "axios";
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import FavoriteIcon from '@mui/icons-material/Favorite';
import Grid from '@mui/material/Grid';
import LoginModalBootstrap from "../../common/LoginModalBoostrap";
import Button from '@mui/material/Button';

const HomePage = () => {
    const [swipeSongs, setSwipeSongs] = useState(null);
    const [index, setIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentSong, setCurrentSong] = useState(null);
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);


    const handleModalClose = () => setIsLoginModalOpen(false);


    useEffect(() => {
        const fetchStaticSongs = async () => {
            setLoading(true);
            setError(null);
            setSwipeSongs(null);
            setCurrentSong(null);
            setIndex(0);
            try {
                const { data: swipingSongs } = await axios.get('http://localhost:3000/api/public/static-swiping-songs');
                if (!swipingSongs) {
                    throw new Error('No swiping songs found');
                }
                setSwipeSongs(swipingSongs);
                setCurrentSong(swipingSongs[0]);

                console.log(swipingSongs);
            } catch (e) {
                setError(e.message || 'An error occurred');

            } finally {
                setLoading(false);
            }
        }
        fetchStaticSongs();
    }, []);


    if (loading) {
        return <div><LoadingSpinner /></div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }


    if (index >= swipeSongs.length) {
        return (
            <div className="centeritems">
                <LoginModalBootstrap isOpen={isLoginModalOpen} onClose={handleModalClose} />
                <Button onClick={() => setIsLoginModalOpen(true)} variant="contained" color="primary">Sign up to start swiping</Button>
            </div>
        )
    }


    const handleButtonClick = () => {
        setCurrentSong(swipeSongs[index + 1]);
        setIndex(index + 1);
    }

    return (
        <>
                <div className="centeritems">
                {currentSong && (
                    <Card sx={{ maxWidth: 350 }} className="dashsong">
                        <CardMedia
                            component="img"
                            height="350"
                            image={currentSong.artist_image}
                            alt={`${currentSong.artist_name} image`}
                        />
                        <CardContent>
                            <div>
                                <h3>{currentSong.title}</h3>
                                <h4>{currentSong.artist_name}</h4>

                                <audio
                                    controls
                                    src={currentSong.preview}
                                    style={{ width: '100%', marginTop: '10px' }}
                                >
                                    Your browser does not support the audio element.
                                </audio>
                                <Grid container spacing={2} >
                                    <Grid size={6} className="centertext">

                                        <IconButton onClick={handleButtonClick} aria-label="dislike" size="large">
                                            <CloseIcon fontSize="large" />
                                        </IconButton>

                                    </Grid>
                                    <Grid size={6} className="centertext">

                                        <IconButton onClick={handleButtonClick} aria-label="like" color="success.light" size="large">
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
export default HomePage;
