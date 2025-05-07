import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import Loading from '../Loading.jsx';
import { AuthContext } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

const Friends = () => {
    const [loading, setLoading] = useState(true);
    const [friends, setFriends] = useState([]);
    const [recommended, setRecommended] = useState([]);

    const [error, setError] = useState(null);

    const navigate = useNavigate();

    const { currentUser } = useContext(AuthContext);

    useEffect(() => {

        if (!currentUser) return;

        //setIsSetup(false);
        setLoading(true);
        setError(null);

        const accountSetUp = async () => {
            let validUid
            try {
                validUid = await axios.get('http://localhost:3000/api/users/find/' + currentUser.uid);
            } catch (e) {
                setError(e);
                console.log(e);
            }

            if (!validUid.data.success) {
                navigate('/setup-profile')

            }

            //setIsSetup(validUid.data.success);
            setLoading(false);
        }
        accountSetUp()

        const fetchFriendsAndRecommendations = async () => {
            try {
                const [friendsRes, likedSongsRes, usersRes] = await Promise.all([
                    axios.get(`http://localhost:3000/api/users/${currentUser.uid}/friends`),
                    axios.get(`http://localhost:3000/api/users/${currentUser.uid}/liked-songs`),
                    axios.get(`http://localhost:3000/api/users/with-liked-songs`)
                ]);

                const friendsData = friendsRes.data;
                const myLikedSongs = likedSongsRes.data;
                const allUsers = usersRes.data;

                const recommendedUsers = allUsers
                    .filter(user => user.uid !== currentUser.uid && !friendsData.some(f => f.uid === user.uid))
                    .filter(user => {
                        const overlap = user.likedSongs.filter(song => myLikedSongs.includes(song));
                        return overlap.length > 0;
                    });

                setFriends(friendsData);
                setRecommended(recommendedUsers);
            } catch (error) {
                console.error("Error fetching friends/recommendations:", error);
            }
        };

        fetchFriendsAndRecommendations();
    }, [currentUser]);



    if (loading) {
        <>
            <Loading />
        </>
    }
    else {
        return (
            <>
                <div>
                    {error && <h2>{error}</h2>}
                    <h2>Your Friends</h2>
                    <ul>
                        {friends.map(friend => (
                            <li key={friend.uid}>
                                <Link to={`/profile/${friend.uid}`}>{friend.name}</Link>
                            </li>
                        ))}
                    </ul>

                    <h2>Recommended Friends</h2>
                    <ul>
                        {recommended.map(user => (
                            <li key={user.uid}>
                                <Link to={`/profile/${user.uid}`}>{user.name}</Link>
                            </li>
                        ))}
                    </ul>
                </div>
            </>
        )
    }
}

export default Friends;