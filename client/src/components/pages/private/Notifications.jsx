import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import axios from "axios";
import LoadingSpinner from "../../common/LoadingSpinner";
import styled from 'styled-components';

const NotificationsContainer = styled.li`
    position: relative;
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

const RecsContainer = styled.div`
    background-color: rgb( 0 100 200/.2);
    &:opacity{
    
    }
`

const DeleteButton = styled.button`
    position: absolute;
    left: 0px;
    top: 0px;
    border: none;
    background: transparent;
    color: #999;
    cursor: pointer;
    font-size: 16px;

    &:hover {
        background-color: red;
    }
`;

const ScrollContainer = styled.div`
    height: 70vh;
    overflow-y: auto;
`;

const Notifications = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const [lastVisibleId, setLastVisibleId] = useState(null);
    const [hasMore, setHasMore] = useState(false);
    const [hoveredId, setHoveredId] = useState(null);
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
        const loadMore = notifications.length < 20 && hasMore && !loading;
        if (loadMore) {
            getNotifications(lastVisibleId);
        }
    }, [notifications, hasMore, loading, lastVisibleId]);

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
        const scrollbar = () => {
            if (scroll.current) {
                scroll.current.removeEventListener('scroll', handleScroll);
            }
        };
        return scrollbar;
    }, [lastVisibleId, loading, hasMore]);

    const getNotifications = async (page = null) => {
        try {
            // #TODO make sure currentUser cannot change or delete user(username)
            //  if currentUser is not the owner of the profile 
            const idToken = await currentUser.getIdToken();
            const currentUserResponse = await axios.get(`http://localhost:3000/api/users/notifications`, {
                headers: {
                    'Authorization': `Bearer ${idToken}`,
                    'Content-Type': 'application/json'
                },
                params: page ? { startAfter: page } : {}
            });
            const notifs = currentUserResponse.data.notifications;
            const newLastVisibleId = currentUserResponse.data.lastVisible;
            if (!newLastVisibleId || newLastVisibleId === lastVisibleId) {
                setHasMore(false);
            } else {
                setHasMore(true);
                setLastVisibleId(newLastVisibleId);
            }
            setNotifications(prev => {
                const filteredNotifs = notifs.filter(n => !prev.map(n => n.id).includes(n.id));
                return [...prev, ...filteredNotifs];
            });

            setLoading(false);
        } catch (e) {
            setError(e.message);
            setLoading(false);
        }
    };

    const handleDelete = async (notif) => {
        if (disableDelete) {
            return;
        }
        setDisableDelete(true);
        try {
            const idToken = await currentUser.getIdToken();
            const response = await axios.delete(`http://localhost:3000/api/users/notifications/${notif.id}`, {
                headers: {
                    'Authorization': `Bearer ${idToken}`,
                },
            });
            if (response.data.success) setNotifications(prev => prev.filter(n => n.id !== notif.id));
            else throw response.data.error;
            setDisableDelete(false);
        } catch (e) {
            setError(e.message)
        }
    };

    const handleNotifClick = (notif) => {
        try {
            if (notif.type === 'friend_request') {
                navigate(`/profile/${notif.fromId}`);
            } else if (notif.type === 'login_recommendations') {
                navigate(`/friends/${currentUser.uid}`);
            }
        } catch (e) {
            setError(e.message);
        }
    };

    if (loading) return <div><LoadingSpinner /></div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div>
            <h1>Notifications</h1>
            <div>
                {notifications.length === 0 ? (<p>No notifications</p>) : (
                    <ScrollContainer ref={scroll}>
                        <ol>
                            {notifications.map((notif, index) => (
                                <NotificationsContainer key={`${notif.id} + ${index}`} onClick={() => handleNotifClick(notif)} onMouseEnter={() => setHoveredId(notif.id)} onMouseLeave={() => setHoveredId(null)}>
                                    {notif.type === 'friend_request' && (
                                        <>
                                            <img src={notif.avatar_url} alt="avatar" width={40} />
                                            <strong>{notif.username}</strong> sent you a friend request
                                        </>
                                    )}
                                    {notif.type === 'login_recommendations' && (
                                        <RecsContainer>
                                            We've found some user's we think you'd like to meet:
                                            {notif.recommendations.map(user => (
                                                <div key={user.id}>
                                                    <p><img src={user.avatar_url} alt={user.username} width={30} />{user.username}</p>
                                                </div>
                                            ))}

                                        </RecsContainer>
                                    )}
                                    {notif.type === 'static' && (
                                        <>
                                            <p>{notif.message}</p>
                                        </>
                                    )}
                                    {hoveredId === notif.id && (
                                        <DeleteButton
                                            onClick={(e) => { e.stopPropagation(); handleDelete(notif); }}
                                            // style={{
                                            //     position: 'absolute',
                                            //     right: '10px',
                                            //     top: '10px',
                                            //     border: 'none',
                                            //     background: 'transparent',
                                            //     color: '#999',
                                            //     cursor: 'pointer'
                                            // }}
                                            title="Delete notification"
                                        >
                                            <img src="public/trash-347.png" width={16} height={16} ></img>
                                        </DeleteButton>
                                    )}
                                </NotificationsContainer>
                            ))}
                            {/* {hasMore && (
                            <button onClick={() => getNotifications(lastVisibleId)}>
                                Load More
                            </button>
                        )} */}
                        </ol>
                        {loading && <p>Loading more...</p>}
                    </ScrollContainer>
                )}
            </div>
        </div>
    );
};

export default Notifications; 