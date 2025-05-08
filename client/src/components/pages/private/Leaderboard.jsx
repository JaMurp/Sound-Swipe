
import React from 'react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import LoadingSpinner from '../../common/LoadingSpinner';
import { useAuth } from '../../../context/AuthContext';

const Leaderboard = () => {
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [trendingSongs, setTrendingSongs] = useState(null);

    const {currentUser} = useAuth();
    useEffect(() => {
        const getTrendingSongs = async () => {
            try {
                const {data} = await axios.get('http://localhost:3000/api/songs/trending', {
                    headers: {
                        'Authorization': `Bearer ${currentUser.accessToken}`
                    }
                });


                for (const song of data) {
                    try {
                        const {data} = await axios.post('http://localhost:3000/api/songs/song/alreadyLiked', {
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
                setLoading(false);
            } catch (error) {
                setLoading(false);
                setError(error);
            }         
        }
        getTrendingSongs();
    }, []);

    const addToLikes = async (songId) => {
        try {
            const {data} = await axios.post('http://localhost:3000/api/songs/like', {
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

    if (error) return <div>{error}</div>;
    if (loading) return <div><LoadingSpinner /></div>;

    return (
        <div>
            {error && <div>{error}</div>}
            <div>
                <h1>Trending Leaderboard</h1>
            </div>

            <div>
                {trendingSongs && trendingSongs.map((song) => (
                    <div key={song.id}>
                        <h2>{song.songTitle}</h2>
                        <img src={song.artist.artistImage} alt={song.artist.artistName} />
                        <p>{song.artist.artistName}</p>
                        <audio src={song.songPreview} controls />
                        {song.alreadyLiked ? <button>Already liked</button> : <button onClick={() => addToLikes(song.id)}>Add to your likes</button>}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Leaderboard;

