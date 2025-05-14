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
import Box from '@mui/material/Box';
import SearchIcon from '@mui/icons-material/Search';
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';



const FriendsPage = () => {
    const [friends, setFriends] = useState([]);
    const [recommendedFriends, setRecommendedFriends] = useState([]);
    const [loading, setLoading] = useState(true);
    const [profileOwner, setProfileOwner] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const { userId } = useParams();
    const [searchQuery, setSearchQuery] = useState('');

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
                    console.log("ALWAYS HAPPENS")
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

    const search = friends.filter(friend =>
        friend.username.toLowerCase().includes(searchQuery.trim().toLowerCase())
    )

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
                            <Box sx={{ display: 'flex', justifyContent: "space-between", margin: 2, alignItems: "center" }}>
                                <h3 className="mb-0">Your Friends: {friends.length} </h3>
                                <Stack direction="row" alignItems="center" display={"flex"}>
                                    <SearchIcon className='search-icon me-2' />
                                    <TextField
                                        id="input-with-sx"
                                        label="Search"
                                        variant="standard"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        sx={{ width: '20rem', marginBottom: 2 }}
                                    />
                                </Stack>
                            </Box>
                            < Divider aria-hidden="true" />

                            <Grid container spacing={2} sx={{ marginTop: 2 }}>
                                {search.length === 0 ? (<p className="centertext mt-4">No usernames match your search.</p>) : (
                                    friends.map(friend => (
                                        <Grid size={{ md: 6, lg: 4 }} key={friend.id}>
                                            <ButtonBase
                                                onClick={() => handleFriendClick(friend.id)}
                                                sx={{ width: "100%", marginBottom: 2 }}
                                                component="div"
                                            >
                                                <Card sx={{ width: "100%" }} className="leaderboard-skeleton">
                                                    <CardMedia>
                                                        <Avatar alt={friend.username} src={friend.avatar_url} sx={{ width: 250, height: 250 }} />
                                                    </CardMedia>
                                                    <CardContent sx={{ textAlign: 'center' }} className="mt-3 mb-3">
                                                        <Typography variant="h5" component="div" sx={{ color: 'text.primary' }}>
                                                            {friend.username}
                                                        </Typography>
                                                    </CardContent>
                                                </Card>

                                            </ButtonBase>
                                        </Grid>


                                    ))

                                )}
                            </Grid>

                        </div>
                    )}
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
                                            component="div"
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
