import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import axios from "axios";
import LoadingSpinner from "../../common/LoadingSpinner";
import styled from 'styled-components';

const FriendsContainer = styled.div`
    width: 100%;
    height: calc(100vh - 60px); /* Subtract navbar height */
    color: white;
    background: #121212;
    overflow: hidden;
    position: relative;
`;

const LoadingContainer = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    color: white;
`;

const ErrorContainer = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    color: red;
`;

const FriendsList = styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
`;

// const ProfileLabel = styled.span`
//     font-size: 14px;
//     font-weight: 500;
//     color: #fff;
//     text-transform: uppercase;
//     margin-bottom: 8px;
// `;

// const ProfileName = styled.h1`
//     font-size: 48px;
//     font-weight: 700;
//     margin: 0;
//     color: #fff;
//     margin-bottom: 8px;
// `;

const FriendContainer = styled.div`
    padding: 0 32px;
    max-width: 1955px;
    margin: 0 auto;
    height: 60%;
    overflow-y: auto;
    
    cursor: pointer;
    &:hover {
        opacity: 0.8;
    }
`;

const FriendsPage = () => {
    const [friends, setFriends] = useState([]);
    const [recommendedFriends, setRecommendedFriends] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const { currentUser } = useAuth();

    useEffect(() => {
        const getFriendsList = async () => {
            try {
                if (!currentUser) {
                    navigate('/');
                    return;
                }

                const idToken = await currentUser.getIdToken();
                const { data } = await axios.get('http://localhost:3000/api/users/profile', {
                    headers: {
                        'Authorization': `Bearer ${idToken}`,
                        'Content-Type': 'application/json'
                    }
                });

                setFriends(data.friends);
                setRecommendedFriends(data.recommendedFriends);
                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };

        getFriendsList();
    }, [currentUser, navigate]);

    const handleFriendClick = (friendId) => {
        navigate(`/profile/${friendId}`);
    };

    if (loading) return <LoadingContainer><LoadingSpinner /></LoadingContainer>;
    if (error) return <ErrorContainer>Error: {error}</ErrorContainer>;

    return (
        <FriendsContainer>
            <h2>Friends:</h2>
            <FriendsList>
                {friends.map(friend => (
                    <FriendContainer key={friend.id} onClick={() => handleFriendClick(friend.id)}>
                        <img src={friend.avatar_url} alt={friend.username} />
                        <h3>{friend.username}</h3>
                    </FriendContainer>
                ))}
            </FriendsList>
            <h3>Recommended Friends</h3>
            {/* <FriendsList>
                {recommendedFriends.map(user => (
                    <FriendContainer key={user.id} onClick={() => handleFriendClick(user.id)}>
                        <img src={user.avatar_url} alt={user.username} />
                        <h3>{user.username}</h3>
                    </FriendContainer>
                ))}
            </FriendsList> */}
        </FriendsContainer>
    );
};

export default FriendsPage; 