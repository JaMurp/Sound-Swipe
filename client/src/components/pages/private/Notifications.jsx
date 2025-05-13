import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import axios from "axios";
import LoadingSpinner from "../../common/LoadingSpinner";
import Avatar from '@mui/material/Avatar';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import ButtonBase from '@mui/material/ButtonBase';
import CloseIcon from '@mui/icons-material/Close';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';


const Notifications = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const [lastVisibleId, setLastVisibleId] = useState(null);
    const [hasMore, setHasMore] = useState(false);
    const scroll = useRef(null);
    const [disableDelete, setDisableDelete] = useState(false);
    const navigate = useNavigate();
    const { currentUser } = useAuth();

    useEffect(() => {
        if (!currentUser) {
            navigate('/');
            return;
        }
        setLoading(true);
        getNotifications();
    }, [currentUser]);

    useEffect(() => {
        const handleScroll = () => {
            const container = scroll.current;
            if (!container || loading || !hasMore) return;

            const { scrollTop, scrollHeight, clientHeight } = container;

            if (scrollTop + clientHeight >= scrollHeight - 100) {
                getNotifications(lastVisibleId);
            }
        };

        if (scroll.current) scroll.current.addEventListener('scroll', handleScroll);
        return () => {
            if (scroll.current) scroll.current.removeEventListener('scroll', handleScroll);
        };
    }, [lastVisibleId, loading, hasMore]);

    const getNotifications = async (page = null) => {
        try {
            const idToken = await currentUser.getIdToken();
            const response = await axios.get(`http://localhost:3000/api/users/notifications`, {
                headers: {
                    'Authorization': `Bearer ${idToken}`,
                    'Content-Type': 'application/json'
                },
                params: page ? { startAfter: page } : {}
            });

            const { notifications: notifs, lastVisible } = response.data;

            setHasMore(lastVisible !== lastVisibleId);
            setLastVisibleId(lastVisible);
            setNotifications(prev => [...prev, ...notifs]);
            setLoading(false);
        } catch (e) {
            setError(e.message);
            setLoading(false);
        }
    };

    const handleDelete = async (notif) => {
        if (disableDelete) return;
        setDisableDelete(true);

        try {
            const idToken = await currentUser.getIdToken();
            const response = await axios.delete(`http://localhost:3000/api/users/notifications/${notif.id}`, {
                headers: { 'Authorization': `Bearer ${idToken}` },
            });

            if (response.data.success) {
                setNotifications(prev => prev.filter(n => n.id !== notif.id));
            }

            setDisableDelete(false);
        } catch (e) {
            setError(e.message);
        }
    };

    // const handleDeleteAll = async () => {
    //     if (disableDelete) return;
    //     setDisableDelete(true);

    //     try {
    //         const idToken = await currentUser.getIdToken();
    //         const response = await axios.delete(`http://localhost:3000/api/users/notifications/${notif.id}`, {
    //             headers: { 'Authorization': `Bearer ${idToken}` },
    //         });

    //         if (response.data.success) {
    //             setNotifications(prev => prev.filter(n => n.id !== notif.id));
    //         }

    //         setDisableDelete(false);
    //     } catch (e) {
    //         setError(e.message);
    //     }
    // };

    const handleNotifClick = (notif) => {
        if (notif.type === 'friend_request') {
            navigate(`/profile/${notif.fromId}`);
        } else if (notif.type === 'login_recommendations') {
            navigate(`/friends/${currentUser.uid}`);
        }
    };

    if (loading) return <div><LoadingSpinner /></div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div>
            <div className="centertext mt-4">
                <h1>Notifications</h1>
            </div>
            <div className="" ref={scroll}>
                {notifications.length === 0 ? (
                    <div className="centertext mt-4">
                        <h5>No Notifications</h5>
                    </div>

                ) : (

                    <div className="center-leaderboard">
                        {notifications.map((notif) => (
                            <div
                                key={notif.id}
                                className=""
                                onClick={() => handleNotifClick(notif)}
                            >
                                <Stack direction="row" spacing={1} alignItems={'center'} justifyContent="center" sx={{ margin: 1, }}>


                                    <ButtonBase
                                        onClick={() => handleNotifClick(notif)}
                                        className=""
                                        sx={{ display: "flex", minWidth: 800, maxWidth: 800 }}
                                    >
                                        <Card sx={{ display: 'flex', width: '100%', alignItems: 'center', padding: 1 }}>

                                            {notif.type === 'friend_request' && (
                                                <>
                                                    <Avatar
                                                        alt={notif.username}
                                                        src={notif.avatar_url}
                                                        sx={{ width: 40, height: 40 }}
                                                    />
                                                    <Typography variant="body1" sx={{ marginLeft: 2 }}>
                                                        <strong>{notif.username}</strong> sent you a friend request
                                                    </Typography>

                                                </>
                                            )}

                                            {notif.type === 'login_recommendations' && (
                                                <CardContent>
                                                    <h5 className="mt-3 mb-2">
                                                        We've found some users we think you'd like to meet:
                                                    </h5>

                                                    {notif.recommendations.map(user => (
                                                        <Stack direction="row" spacing={1} key={user.id} sx={{ margin: 1 }}>

                                                            <Avatar
                                                                alt={user.username}
                                                                src={user.avatar_url}
                                                                sx={{ width: 30, height: 30 }}
                                                            />

                                                            <Typography variant="body1" sx={{ marginLeft: 2 }}>
                                                                {user.username}
                                                            </Typography>

                                                        </Stack>
                                                    ))}
                                                </CardContent>
                                            )}

                                            {notif.type === 'static' && <p>{notif.message}</p>}

                                            {/* {hoveredId === notif.id && (
                                            <button
                                                className=""
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDelete(notif);
                                                }}
                                            >
                                                <img src="public/trash-347.png" width={16} height={16} alt="Delete" />
                                            </button>
                                        )} */}

                                        </Card>

                                    </ButtonBase>

                                    <Tooltip title="Delete" placement="top" slotProps={{
                                        popper: {
                                            modifiers: [
                                                {
                                                    name: 'offset',
                                                    options: {
                                                        offset: [0, -14],
                                                    },
                                                },
                                            ],
                                        },
                                    }}>
                                        <IconButton
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDelete(notif);
                                            }}
                                            size="large"
                                        // sx={{ margin: 'med' }}
                                        >
                                            <CloseIcon fontSize="medium" />
                                        </IconButton>
                                    </Tooltip>
                                </Stack>

                            </div>
                        ))}
                    </div>
                )}
                {loading && <p>Loading more...</p>}
            </div>
        </div>
    );
};

export default Notifications;
