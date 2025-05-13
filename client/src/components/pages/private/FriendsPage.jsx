import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import axios from "axios";
import LoadingSpinner from "../../common/LoadingSpinner";
import Avatar from '@mui/material/Avatar';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import ButtonBase from '@mui/material/ButtonBase';
import Grid from '@mui/material/Grid';
import Divider from '@mui/material/Divider';


const FriendsPage = () => {
    const [friends, setFriends] = useState([]);
    const [recommendedFriends, setRecommendedFriends] = useState([]);
    const [loading, setLoading] = useState(true);
    const [profileOwner, setProfileOwner] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const { userId } = useParams();

    useEffect(() => {
        const getFriendsList = async () => {
            try {
                if (!currentUser) {
                    navigate('/');
                    return;
                }
                if (!userId) {
                    navigate(`/profile/${currentUser.uid}`)
                    return;
                }
                const idToken = await currentUser.getIdToken();
                let url = `http://localhost:3000/api/users/profile/${userId}`;
                if (currentUser.uid === userId) {
                    setProfileOwner(true);
                    url = `http://localhost:3000/api/users/profile/`;
                }
                const { data } = await axios.get(url, {
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
    }, [currentUser, navigate, userId]);

    const handleFriendClick = (friendId) => {
        navigate(`/profile/${friendId}`);
    };

    // if (loading) return <div><LoadingSpinner /></div>;
    if (error) return <div>{error}</div>;

    return (
        <div>
            <div className="centertext mt-4">
                <h1>Friends</h1>
            </div>
            {loading ?
                <div>
                    <LoadingSpinner />
                </div>
                :
                <div>


                    {friends.length === 0 ? (
                        <div className="centertext mt-5 mb-5" >
                            <h3>You have no friends yet.</h3>
                            <h6>Lol what a loser</h6>
                        </div>
                    ) : (

                        <div>
                            <h3>Your Friends: {friends.length}</h3>
                            {friends.map(friend => (
                                <div
                                    key={friend.id}
                                    className="friend-container"
                                    onClick={() => handleFriendClick(friend.id)}
                                >

                                    <img src={friend.avatar_url} alt={friend.username} width={75} />
                                    <h3>{friend.username}</h3>

                                </div>
                            ))}
                        </div>)
                    }
                    < Divider aria-hidden="true" />

                    {profileOwner && (

                        <div className="mt-5">
                            <div className="centertext mb-5">
                                <h2>Recommended Friends</h2>
                            </div>

                            <Grid container spacing={2} sx={{ marginTop: 2 }}>
                                {recommendedFriends.map(user => (
                                    <Grid size={{ md: 6, lg: 4 }} key={user.id}>
                                        <ButtonBase

                                            onClick={() => handleFriendClick(user.id)}
                                            sx={{ width: "100%", marginBottom: 2 }}
                                        >
                                            <Card sx={{ width: "100%" }} className="leaderboard-skeleton">
                                                <CardMedia>
                                                    <Avatar alt={user.username} src={user.avatar_url} sx={{ width: 250, height: 250 }} />
                                                </CardMedia>
                                                <CardContent sx={{ textAlign: 'center' }} className="mt-3 mb-3">
                                                    <Typography variant="h5" component="div" sx={{ color: 'text.primary' }}>
                                                        {user.username}
                                                    </Typography>
                                                </CardContent>

                                            </Card>
                                        </ButtonBase>
                                    </Grid>
                                ))}
                            </Grid>
                        </div>
                    )}

                </div>
            }
        </div>

    );

};

export default FriendsPage;
