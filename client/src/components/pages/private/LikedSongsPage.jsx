import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../../context/AuthContext';
import axios from 'axios';
import LoadingSpinner from '../../common/LoadingSpinner';
import { useNavigate } from 'react-router-dom';


const LikedSongsPage = () => {

    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [likedSongs, setLikedSongs] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [refresh, setRefresh] = useState(false);


    useEffect(() => {
        const fetchLikedSongs = async () => {

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
    if (error) {
        return <div>Error: {error.message}</div>;
    }
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
        } catch (error) {
            setError(error);
        }
    };

    const search = likedSongs.filter(song =>
        song.songTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        song.artistName.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <>
            <h1>Liked Songs</h1>
            <input type="text" placeholder="Search your liked songs..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            {search.length === 0 ? (<p>No songs match your search.</p>) : (
                search.map((song) => (
                    <div key={song.id}>
                        <img src={song.artistImage} alt={song.artistName} />
                        <div>
                            <h2>{song.songTitle}</h2>
                            <p>{song.artistName}</p>
                        </div>


                        <button onClick={() => handleUnlike(song.id)}>Unlike</button>
                    </div>
                ))
            )}
        </>
    );
};

export default LikedSongsPage;