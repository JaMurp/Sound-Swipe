import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../../context/AuthContext';
import axios from 'axios';
import LoadingSpinner from '../../common/LoadingSpinner';
import { useNavigate } from 'react-router-dom';
import AudioPlayer from '../../common/AudioPlayer';

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

    if (loading) {
        return <div><LoadingSpinner /></div>;
    }

    // if (error) {
    //     return <div>Error: {error.message}</div>;
    // }

    if (likedSongs.length === 0) {
        return (
            <div>
                <h1>Liked Songs</h1>
                <p>No liked songs found</p>
                <button onClick={() => navigate('/dashboard')}>Go to Dashboard</button>
            </div>
        );
    }

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

    return (
        <>
            <h1>Liked Songs</h1>
            {error && <p>Error: {error.message}</p>}

            <input type="text" placeholder="Search your liked songs..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            {search.length === 0 ? (<p>No songs match your search.</p>) : (
                search.map((song) => (
                    <div key={song.id}>
                        <img src={song.artistImage} alt={song.artistName} />
                        <div>
                            <h2>{song.songTitle}</h2>
                            <p>{song.artistName}</p>
                            <AudioPlayer 
                                getUrl={() => getAudioUrl(song.id)} 
                                songId={song.id}
                                currentlyPlayingId={currentlyPlayingId}
                                setCurrentlyPlayingId={setCurrentlyPlayingId}
                            />
                        </div>


                        <button onClick={() => handleUnlike(song.id)}>Unlike</button>
                    </div>
                ))
            )}
        </>
    );
};

export default LikedSongsPage;