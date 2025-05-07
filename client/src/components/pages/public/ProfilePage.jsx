import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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

const ProfilePage = () => {
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const { currentUser } = useAuth();

    useEffect(() => {
        const getProfileData = async () => {
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

                setUserData(data);
                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };

        getProfileData();
    }, [currentUser, navigate]);

    const handleEditProfile = () => {
        navigate('/settings');
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
                                </ProfileStats>
                                <EditButton onClick={handleEditProfile}>
                                    Edit profile
                                </EditButton>
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