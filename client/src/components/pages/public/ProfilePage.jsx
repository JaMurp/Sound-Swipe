import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import axios from "axios";
import LoadingSpinner from "../../common/LoadingSpinner";
import styled from 'styled-components';

const ProfileContainer = styled.div`
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

const ProfileHeader = styled.div`
    width: 100%;
    padding: 24px 32px;
    background: linear-gradient(transparent 0, rgba(0,0,0,.5) 100%);
    height: 40%;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
`;

const ProfileInfo = styled.div`
    display: flex;
    align-items: flex-end;
    gap: 24px;
`;

const ProfileImage = styled.img`
    width: 192px;
    height: 192px;
    border-radius: 50%;
    object-fit: cover;
    box-shadow: 0 4px 60px rgba(0, 0, 0, 0.5);
`;

const ProfileText = styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
`;

const ProfileLabel = styled.span`
    font-size: 14px;
    font-weight: 500;
    color: #fff;
    text-transform: uppercase;
    margin-bottom: 8px;
`;

const ProfileName = styled.h1`
    font-size: 48px;
    font-weight: 700;
    margin: 0;
    color: #fff;
    margin-bottom: 8px;
`;

const ProfileStats = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
    color: #b3b3b3;
    font-size: 14px;
`;

const Bio = styled.p`
    color: #b3b3b3;
    font-size: 14px;
    margin: 16px 0;
`;

const ContentContainer = styled.div`
    padding: 0 32px;
    max-width: 1955px;
    margin: 0 auto;
    height: 60%;
    overflow-y: auto;
    
    /* Custom scrollbar styling */
    &::-webkit-scrollbar {
        width: 8px;
    }
    
    &::-webkit-scrollbar-track {
        background: transparent;
    }
    
    &::-webkit-scrollbar-thumb {
        background: #888;
        border-radius: 4px;
    }
    
    &::-webkit-scrollbar-thumb:hover {
        background: #555;
    }
`;

const ContentSection = styled.div`
    margin: 40px 0;
`;

const SectionHeader = styled.div`
    display: flex;
    align-items: center;
    margin-bottom: 20px;
    justify-content: space-between;
`;

const SectionTitle = styled.h2`
    font-size: 24px;
    font-weight: 700;
    margin: 0;
    color: #fff;
`;

const ShowAllButton = styled.button`
    background: none;
    border: none;
    color: #b3b3b3;
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    padding: 0;
    &:hover {
        color: white;
    }
`;

const EditButton = styled.button`
    background: transparent;
    border: 1px solid #727272;
    border-radius: 4px;
    color: white;
    padding: 5px 12px;
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    margin-top: 12px;
    transition: all 0.2s ease;

    &:hover {
        border-color: white;
        transform: scale(1.02);
    }
`;

const FriendButton = styled.button`
    background: transparent;
    border: 1px solid #727272;
    border-radius: 4px;
    color: white;
    padding: 5px 12px;
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    margin-top: 12px;
    transition: all 0.2s ease;

    &:hover {
        border-color: white;
        transform: scale(1.02);
    }
`;

const FriendCounter = styled.span`
    color: #fff;
    font-weight: bold;
    cursor: pointer;
    &:hover {
        text-decoration: underline;
    }
`;

const ProfilePage = () => {
    const [userData, setUserData] = useState(null);
    const [friendsCount, setFriendsCount] = useState(0);
    const [profileOwner, setProfileOwner] = useState(false);
    const [friended, setFriended] = useState(false);
    const [requested, setRequested] = useState(false);
    const [refresh, setRefresh] = useState(false);
    const [friendDefault, setFriendDefault] = useState(false);
    const [receivedRequest, setRecievedRequest] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const { userId } = useParams();


    useEffect(() => {
        const getProfileData = async () => {
            try {
                if (!currentUser) {
                    navigate('/');
                    return;
                }
                if (!userId) {
                    navigate(`/profile/${currentUser.uid}`)
                    return;
                }
                // #TODO make sure currentUser cannot change or delete user(username)
                //  if currentUser is not the owner of the profile 
                const idToken = await currentUser.getIdToken();
                const currentUserResponse = await axios.get(`http://localhost:3000/api/users/profile/`, {
                    headers: {
                        'Authorization': `Bearer ${idToken}`,
                        'Content-Type': 'application/json'
                    }
                });
                let data;
                if (currentUser.uid === userId) {
                    setProfileOwner(true);
                    data = currentUserResponse.data;
                }
                else {
                    const otherUserResponse = await axios.get(`http://localhost:3000/api/users/profile/${userId}`, {
                        headers: {
                            'Authorization': `Bearer ${idToken}`,
                            'Content-Type': 'application/json'
                        }
                    });

                    data = otherUserResponse.data;

                    if (data.friends.some(friend => friend.id === currentUser.uid)) setFriended(true);
                    else if (data.incomingRequests.some(requester => requester.id === currentUser.uid)) setRequested(true);
                    else if (currentUserResponse.data.incomingRequests.some(requester => requester.id === userId)) setRecievedRequest(true);
                    else setFriendDefault(true);
                }

                setUserData(data);
                setFriendsCount(data.friends.length);
                setLoading(false);
            } catch (e) {
                setError(e.message);
                setLoading(false);
            }
        };

        getProfileData();
    }, [currentUser, navigate, userId, refresh]);

    const handleEditProfile = () => {
        navigate('/settings');
    };

    const handleFriendsClick = () => {
        navigate(`/friends/${userId}`);
    };

    const handleRequestFriend = async () => {
        try {
            const idToken = await currentUser.getIdToken();
            const response = await axios.post(`http://localhost:3000/api/users/friend-request/${userId}`, {
            }, {
                headers: {
                    Authorization: `Bearer ${idToken}`,
                    'Content-Type': 'application/json'
                }
            });
            if (response.data.success) {
                setRequested(true);
                setFriendDefault(false);
            } else {
                setRequested(false);
                setError(response.data.message);
            }
        } catch (e) {
            setError(e);
            setRequested(false);
        }
    };

    const handleAcceptFriend = async () => {
        try {
            const idToken = await currentUser.getIdToken();
            const response = await axios.post(`http://localhost:3000/api/users/accept-request/${userId}`, {
            }, {
                headers: {
                    Authorization: `Bearer ${idToken}`,
                    'Content-Type': 'application/json'
                }
            });
            if (response.data.success) {
                setFriended(true);
                setRecievedRequest(false);
                setRefresh(!refresh);
            } else {
                setFriended(false);
                setError(response.data.message);
            }
        } catch (e) {
            setFriended(false);
            setError(e);
        }
    };

    const handleRejectFriend = async () => {
        try {
            const idToken = await currentUser.getIdToken();
            const response = await axios.post(`http://localhost:3000/api/users/reject-request/${userId}`, {
            }, {
                headers: {
                    Authorization: `Bearer ${idToken}`,
                    'Content-Type': 'application/json'
                }
            });
            if (response.data.success) {
                setFriendDefault(true);
                setRecievedRequest(false);
            } else {
                setFriendDefault(false);
                setError(response.data.message);
            }
        } catch (e) {
            setFriendDefault(false);
            setError(e);
        }
    };

    const handleRemoveFriend = async () => {
        try {
            setFriended(false)
            const idToken = await currentUser.getIdToken();
            const response = await axios.post(`http://localhost:3000/api/users/remove-friend/${userId}`, {
            }, {
                headers: {
                    Authorization: `Bearer ${idToken}`,
                    'Content-Type': 'application/json'
                }
            });
            if (response.data.success) {
                setFriended(false);
                setFriendDefault(true);
                setRefresh(!refresh);
            } else {
                setFriended(true);
                setError(response.data.message);
            }
            setRefresh(!refresh);
        } catch (e) {
            setFriended(true);
            setError(e);
        }
    };

    if (loading) return <LoadingContainer><LoadingSpinner /></LoadingContainer>;
    if (error) return <ErrorContainer>Error: {error}</ErrorContainer>;

    return (
        <ProfileContainer>
            {userData && (
                <>
                    <ProfileHeader>
                        <ProfileInfo>
                            <ProfileImage
                                src={userData.avatar_url}
                                alt={userData.username}
                            />
                            <ProfileText>
                                <ProfileLabel>Profile</ProfileLabel>
                                <ProfileName>{userData.username}</ProfileName>
                                <ProfileStats>
                                    <span>Member since {new Date(userData.createdAt._seconds * 1000).getFullYear()}</span>
                                    <FriendCounter onClick={handleFriendsClick}>
                                        Friends:
                                        {friendsCount}
                                    </FriendCounter>
                                </ProfileStats>
                                {profileOwner && (
                                    <EditButton onClick={handleEditProfile}>
                                        Edit profile
                                    </EditButton>
                                )}
                                {friendDefault && !requested && (
                                    <FriendButton onClick={handleRequestFriend}>
                                        Request
                                    </FriendButton>
                                )}
                                {friended && (
                                    <FriendButton onClick={handleRemoveFriend}>
                                        Remove
                                    </FriendButton>
                                )}
                                {requested && (
                                    <span>
                                        Requested!
                                    </span>
                                )}
                                {receivedRequest && (
                                    <span>
                                        <FriendButton onClick={handleAcceptFriend}>
                                            Accept
                                        </FriendButton>
                                        <FriendButton onClick={handleRejectFriend}>
                                            Reject
                                        </FriendButton>
                                    </span>
                                )}
                                {userData.bio && <Bio>{userData.bio}</Bio>}
                            </ProfileText>
                        </ProfileInfo>
                    </ProfileHeader>
                </>
            )}
        </ProfileContainer>
    );
};

export default ProfilePage; 