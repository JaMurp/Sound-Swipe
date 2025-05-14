import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { useRef } from "react";
import axios from "axios";
import LoadingSpinner from "../../common/LoadingSpinner";
import styled from 'styled-components';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import AudioPlayer from '../../common/AudioPlayer';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Link from '@mui/material/Link';
import { grey } from "@mui/material/colors";
import Skeleton from '@mui/material/Skeleton';



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
    const [likedSongs, setLikedSongs] = useState([]);
    const [currentlyPlayingId, setCurrentlyPlayingId] = useState(null);
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const { userId } = useParams();
    const [loadingSongs, setLoadingSongs] = useState(true);



    const [buttonSemaphore, setButtonSemaphore] = useState(false);



    useEffect(() => {
        const getProfileData = async () => {
            console.log("Fetching profile data..."); // Add this

            try {

                // added this to prevent the page from showing old data
                setLoading(true);
                setError(null);
                setUserData(null);
                setFriendsCount(0);
                setProfileOwner(false);
                setFriended(false);
                setRequested(false);
                setRecievedRequest(false);
                setFriendDefault(false);
                setButtonSemaphore(false);

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
                console.log("User data from profile API:", data);
                setFriendsCount(data.friends.length);
                setLoading(false);
            } catch (e) {
                setError(e.message);
                setLoading(false);
            }
        };

        getProfileData();
    }, [currentUser, navigate, userId, refresh]);

    useEffect(() => {
        setLoadingSongs(true);
        const fetchLikedSongs = async () => {
            if (!friended || !userId) return;

            try {
                const idToken = await currentUser.getIdToken();
                const { data } = await axios.get(`http://localhost:3000/api/users/liked-songs/${userId}`, {
                    headers: {
                        'Authorization': `Bearer ${idToken}`
                    }
                });

                if (data.error) {
                    throw new Error(data.error);
                }

                setLikedSongs(data);
            } catch (error) {
                console.error('Error fetching liked songs:', error);
            }
            finally {
                setLoadingSongs(false);
            }
        };

        fetchLikedSongs();
    }, [friended, userId, currentUser]);

    const fileInputRef = useRef(null);
    const [uploading, setUploading] = useState(false);

    const handleProfilePhotoUpload = async (e) => {
        const file = e.target.files[0];
        if (!file || !currentUser) return;

        setUploading(true);

        const formData = new FormData();
        formData.append("photo", file);

        const idToken = await currentUser.getIdToken();

        const response = await fetch("http://localhost:3000/api/profile-photo/upload-profile-photo", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${idToken}`,
            },
            body: formData,
        });

        const data = await response.json();
        if (data.imageUrl) {
            setUserData((prev) => ({
                ...prev,
                avatar_url: data.imageUrl,
            }));
        }

        setUploading(false);
    };


    const handleEditProfile = () => {
        navigate('/settings');
    };

    const handleFriendsClick = () => {
        navigate(`/friends/${userId}`);
    };

    const handleRequestFriend = async () => {
        try {
            if (buttonSemaphore) return;
            setButtonSemaphore(true);

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
            setButtonSemaphore(false);
        } catch (e) {
            setError(e);
            setRequested(false);
            setButtonSemaphore(false);
        }
    };

    const handleAcceptFriend = async () => {
        try {
            if (buttonSemaphore) return;
            setButtonSemaphore(true);

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
            setButtonSemaphore(false);
        } catch (e) {
            setFriended(false);
            setError(e);
            setButtonSemaphore(false);
        }
    };

    const handleRejectFriend = async () => {
        try {
            if (buttonSemaphore) return;
            setButtonSemaphore(true);

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
            setButtonSemaphore(false)
        } catch (e) {
            setFriendDefault(false);
            setError(e);
            setButtonSemaphore(false);
        }
    };

    const handleRemoveFriend = async () => {
        try {
            if (buttonSemaphore) return;
            setButtonSemaphore(true);

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
            setButtonSemaphore(false);
            setRefresh(!refresh);
        } catch (e) {
            setFriended(true);
            setError(e);
            setButtonSemaphore(false);
        }
    };

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

    if (loading) return <LoadingSpinner />;
    if (error) return (<p>Error: {error}</p>);

    return (
        <div>
            <div className="centertext mt-4 mb-4">
                <h1>Profile</h1>
            </div >

            {userData && (
                <Stack direction="column" spacing={2} sx={{ alignContent: "center" }}>
                    <div className="center-leaderboard-filter">
                        <Card sx={{ display: "flex", width: "85%" }} >


                            <Grid container spacing={2} sx={{ padding: 2, alignContent: "center", width: "100%" }}>
                                <Grid size={{ sm: 12, md: 3 }} >
                                    <Stack direction="column" spacing={2} alignItems="center">


                                        <Avatar
                                            alt={userData.username}
                                            src={userData.avatar_url}
                                            sx={{ width: 200, height: 200 }}
                                        />


                                        {profileOwner && (
                                            <>
                                                <Button variant="text" onClick={() => fileInputRef.current.click()}>
                                                    Edit Photo
                                                </Button>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    ref={fileInputRef}
                                                    onChange={handleProfilePhotoUpload}
                                                    style={{ display: "none" }}
                                                />
                                                {uploading && <Typography>Uploading...</Typography>}
                                            </>
                                        )}
                                    </Stack>
                                </Grid>

                                <Grid size={{ sm: 12, md: 9 }}>
                                    <Stack direction="column" spacing={2} padding={4}>
                                        <Typography variant="h4">{userData.username}</Typography>
                                        <Stack direction="row" spacing={3} alignItems="center">
                                            <Typography variant="body1">
                                                Member since {new Date(userData.createdAt._seconds * 1000).getFullYear()}
                                            </Typography>
                                            {/* <Button variant="outlined" onClick={handleFriendsClick}>
                                        Friends: {friendsCount}
                                    </Button> */}
                                            <Link
                                                component={"button"}
                                                variant="body1"
                                                onClick={handleFriendsClick}
                                                underline="hover"
                                                color="inherit"
                                            >
                                                Friends: {friendsCount}
                                            </Link>
                                        </Stack>


                                        {profileOwner && (
                                            <Button variant="contained" onClick={handleEditProfile}
                                                sx={{ width: "fit-content", alignSelf: "flex-start" }}>
                                                Edit Profile
                                            </Button>
                                        )}

                                        {friendDefault && !requested && (
                                            <Button variant="contained" onClick={handleRequestFriend}
                                                sx={{ width: "fit-content", alignSelf: "flex-start" }}>
                                                Request
                                            </Button>
                                        )}

                                        {friended && (
                                            <Button variant="contained" onClick={handleRemoveFriend}
                                                sx={{ width: "fit-content", alignSelf: "flex-start" }}>
                                                Remove
                                            </Button>
                                        )}

                                        {requested && (
                                            <Button variant="contained" disabled onClick={handleRequestFriend}
                                                sx={{ width: "fit-content", alignSelf: "flex-start" }}>
                                                Requested!
                                            </Button>
                                        )}

                                        {receivedRequest && (
                                            <Stack direction="row" spacing={2}>
                                                <Button variant="contained" onClick={handleAcceptFriend}
                                                    sx={{ width: "fit-content", alignSelf: "flex-start" }}>

                                                    Accept
                                                </Button>
                                                <Button variant="outlined" onClick={handleRejectFriend}
                                                    sx={{ width: "fit-content", alignSelf: "flex-start" }}>
                                                    Reject
                                                </Button>
                                            </Stack>
                                        )}

                                        {userData.bio ? <Typography variant="body2">{userData.bio}</Typography>
                                            : <Typography variant="body2" sx={{ color: grey[700] }}>No user bio </Typography>}
                                    </Stack>
                                </Grid>
                            </Grid>
                        </Card>

                    </div>
                    <div className="center-leaderboard-filter">
                        {friended && !profileOwner && (
                            <Card sx={{ display: "flex", width: "85%" }} >
                                <Grid container spacing={2} sx={{ padding: 2, alignContent: "center", width: "100%" }}>
                                    <Stack direction="column" spacing={2} width={"100%"}>
                                        <Grid sx={{ xs: 12, sm: 6, width: "100%" }} >
                                            <Typography variant="h5">Liked Songs</Typography>
                                        </Grid>
                                        {loadingSongs ? (
                                            <Stack sx={{ display: 'flex', alignItems: 'center' }} spacing={1}>
                                                <Skeleton variant="rounded" width={"100%"} height={130} sx={{ marginTop: 2 }} />
                                                <Skeleton variant="rounded" width={"100%"} height={130} sx={{ marginTop: 2 }} />
                                                <Skeleton variant="rounded" width={"100%"} height={130} sx={{ marginTop: 2 }} />
                                            </Stack>
                                        ) : (
                                            <div>
                                                {likedSongs && likedSongs.private ? (
                                                    <Typography variant="body1" sx={{ color: grey[700] }}>This user has hidden their liked songs</Typography>
                                                ) : (
                                                    likedSongs.map((song) => (
                                                        <Grid xs={12} sm={6} md={4} key={song.id} width={"100%"}>
                                                            <Card sx={{ display: "flex", width: "100%", marginBottom: 2 }}>
                                                                <CardMedia
                                                                    component="img"
                                                                    sx={{ width: 130 }}
                                                                    image={song.artistImage}
                                                                    alt={song.artistName}
                                                                />
                                                                <CardContent sx={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
                                                                    <Grid container spacing={2} sx={{ width: "100%" }}>
                                                                        <Grid spacing={{ xs: 12, sm: 6 }} sx={{ flexGrow: 1 }}>
                                                                            <Typography variant="h6">{song.songTitle}</Typography>
                                                                            <Typography variant="body2">{song.artistName}</Typography>
                                                                        </Grid>
                                                                        <Grid spacing={{ xs: 12, sm: 6 }} sx={{ display: "flex", justifyContent: "flex-end", alignItems: "center" }}>
                                                                            <AudioPlayer
                                                                                getUrl={() => getAudioUrl(song.id)}
                                                                                songId={song.id}
                                                                                currentlyPlayingId={currentlyPlayingId}
                                                                                setCurrentlyPlayingId={setCurrentlyPlayingId}
                                                                            />
                                                                        </Grid>
                                                                    </Grid>
                                                                </CardContent>
                                                            </Card>
                                                        </Grid>
                                                    ))
                                                )}
                                            </div>
                                        )}
                                    </Stack>
                                </Grid>
                            </Card>

                        )}
                    </div>
                </Stack>
            )}

        </div>
    );
};


export default ProfilePage; 