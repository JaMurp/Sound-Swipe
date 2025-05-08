import React, { useState, useEffect } from "react";
import LoadingSpinner from "../../common/LoadingSpinner";
import { useAuth } from "../../../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";
import Dropdown from "react-bootstrap/Dropdown";
import Switch from '@mui/material/Switch';
import axios from "axios";

const DashboardPage = () => {
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

    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refresh, setRefresh] = useState(false);
    const [currentSong, setCurrentSong] = useState(null);
    const [swipeSongs, setSwipeSongs] = useState(null);
    const [index, setIndex] = useState(0);
    const [selectedGenre, setSelectedGenre] = useState({
        "Pop": true,
        "Rap/Hip Hop": true,
        "Reggaeton": true,
        "Rock": true,
        "Dance": true,
        "R&B": true,
        "Alternative": true,
        "Christian": true,
        "Electro": true,
        "Folk": true,
        "Reggae": true,
        "Jazz": true,
        "Country": true,
        "Salsa": true,
        "Traditional Mexicano": true,
        "Classical": true,
        "Films/Games": true,
        "Metal": true,
        "Soul & Funk": true,
        "African Music": true,
        "Asian Music": true,
        "Blues": true,
        "Brazilian Music": true,
        "Cumbia": true,
        "Indian Music": true,
        "Kids": true,
        "Latin Music": true
    });

    const { currentUser } = useAuth();
    const navigate = useNavigate();



    const buildSelectedGenres = () => {
        return Object.keys(selectedGenre).filter((genre) => selectedGenre[genre]);
    }

    useEffect(() => {
        const fetchSongs = async () => {
            setLoading(true);
            setIndex(0)
            setError(null)
            try {
                if (!currentUser) {
                    navigate('/');
                    return;
                }
                const sendGenres = buildSelectedGenres();

                const idToken = await currentUser.getIdToken();
                const { data } = await axios.post('http://localhost:3000/api/songs', {
                    genres: sendGenres
                }, {
                    headers: {
                        'Authorization': `Bearer ${idToken}`,
                        'Content-Type': 'application/json'
                    }
                });

                console.log('Received songs data:', JSON.stringify(data, null, 2));

                if (!data) {
                    throw new Error('No data received');
                }
                setSwipeSongs(data);
                setCurrentSong(data[0]);

                setLoading(false);

            } catch (error) {
                console.error('Error fetching songs:', error);
                setError(error);
            }
        }

        fetchSongs();
    }, [refresh])


    if (error) return <div>{error}</div>;
    if (loading) return <div><LoadingSpinner /></div>;




    const handleDislikeButton = async () => {
        if (index >= swipeSongs.length - 1) {
            setRefresh(!refresh);
            return;
        }
        try {
            const idToken = await currentUser.getIdToken();
            const {data} = await axios.post('http://localhost:3000/api/songs/seen', {
                songId: swipeSongs[index].id,
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
            const {data} = await axios.post('http://localhost:3000/api/songs/seen', {
                songId: swipeSongs[index].id,
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


    if (!swipeSongs || swipeSongs.length === 0) {
        return (
            <div>
                {error && <div>{error}</div>}
                <div>
                    <h1>No songs found</h1>
                    <button onClick={() => setRefresh(!refresh)}>Try refreshing or changing genres</button>
                </div>
            </div>
        )
    };



    return (
        <>
            <div>
                <Dropdown autoClose="outside" onToggle={(isOpen) => {
                    if (!isOpen) {
                        setRefresh(!refresh);
                    }
                }}>
                    {error && <div>{error}</div>}

                    <Dropdown.Toggle variant="success" id="dropdown-basic">
                        Select Genre
                    </Dropdown.Toggle>

                    <Dropdown.Menu>
                        { genres && genres.length > index && genres.map((genre) => (
                            <Dropdown.Item key={genre} onClick={() => {
                                setSelectedGenre({ ...selectedGenre, [genre]: !selectedGenre[genre] });
                            }}>
                                <Switch checked={selectedGenre[genre]} />
                                {genre}
                            </Dropdown.Item>
                        ))}
                    </Dropdown.Menu>

                </Dropdown>

                <div>
                    <h1>Swipe Songs</h1>
                </div>
                <div>

                    <div>
                        <h3>{swipeSongs[index].songTitle}</h3>
                        <img 
                            src={swipeSongs[index].artist.artistImage} 
                            alt={`${swipeSongs[index].artist.artistName} image`}
                            style={{ width: '200px', height: '200px', objectFit: 'cover' }}
                        />
                        <audio 
                            controls 
                            src={swipeSongs[index].songPreview}
                            style={{ width: '100%', marginTop: '10px' }}
                        >
                            Your browser does not support the audio element.
                        </audio>
                    </div>

                    <button onClick={handleDislikeButton}>Dislike</button>
                    <button onClick={handleLikeButton}>Like</button>
                </div>

            </div>
        </>

    )

}
export default DashboardPage;
