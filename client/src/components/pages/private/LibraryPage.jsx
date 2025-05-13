import React, { useState } from 'react';
import Nav from 'react-bootstrap/Nav';
import LikedSongsPage from './LikedSongsPage';
import PlaylistPage from './PlaylistPage';

const LibraryPage = () => {
    const [activeTab, setActiveTab] = useState('liked-songs');


    return (
        <>
            {/* <Nav justify variant="pills" activeKey={activeTab} onSelect={(selectedKey) => setActiveTab(selectedKey)}>
                <Nav.Item >
                    <Nav.Link eventKey="liked-songs">Liked Songs</Nav.Link>
                </Nav.Item>

                <Nav.Item >
                    <Nav.Link eventKey="playlists">Playlists</Nav.Link>
                </Nav.Item>
            </Nav> */}

            {activeTab === 'liked-songs' && <LikedSongsPage />}
            {/* {activeTab === 'playlists' && <PlaylistPage />} */}
        </>
    );
};



export default LibraryPage;





