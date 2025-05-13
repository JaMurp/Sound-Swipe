import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import './LiveFeed.css';
import { Link } from 'react-router-dom';
const socket = io('http://localhost:3000');

const LiveFeed = () => {
    const [chat, setChat] = useState([]);

    useEffect(() => {
        socket.on('connect', () => {
            console.log('connected to socket');
        });
        return () => {
            socket.disconnect();
        };
    }, []);

    useEffect(() => {
        socket.on('new_liked_song_public', (song) => {
            setChat([...chat, song]);
        });

        return () => {
            socket.off('new_liked_song_public');
        };
    }, [chat]);

    return (
        <div className="live-feed-container">
            <h1 className="feed-title">Live Feed</h1>
            <div className="feed-items">
                {chat.map((item, index) => (
                    <div key={index} className="feed-item">
                        <div className="user-info">
                            <Link to={`/profile/${item.user}`} className="user-name">{item.user}</Link> liked a song
                        </div>
                        <div className="song-info">
                            <img 
                                src={item.song.artistImage} 
                                alt={item.song.artistName} 
                                className="artist-image"
                            />
                            <div className="song-details">
                                <h3 className="song-title">{item.song.songTitle}</h3>
                                <p className="artist-name">{item.song.artistName}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default LiveFeed;