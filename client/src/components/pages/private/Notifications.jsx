import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import axios from "axios";
import LoadingSpinner from "../../common/LoadingSpinner";
import styled from 'styled-components';

const NotificationsContainer = styled.li`
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

const Notifications = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const [lastVisibleId, setLastVisibleId] = useState(null);
    const [hasMore, setHasMore] = useState(true);
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
            setLastVisibleId(currentUserResponse.data.lastVisible);
            setHasMore(currentUserResponse.data.lastVisible != null);
            setNotifications(prev => [...prev, ...notifs]);
            setLoading(false);
        } catch (e) {
            setError(e.message);
            setLoading(false);
        }
    };

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
            <h1>Notifications</h1>
            <div>
                {notifications.length === 0 ? (<p>No notifications</p>) : (
                    <ol>
                        {notifications.map((notif, index) => (
                            <NotificationsContainer key={`${notif.id} + ${index}`} onClick={() => handleNotifClick(notif)}>
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
                                                <p><img src={user.avatar_url} alt={user.username} width={30}/>{user.username}</p>
                                            </div>
                                        ))}

                                    </RecsContainer>
                                )}
                            </NotificationsContainer>
                        ))}
                        {hasMore && (
                            <button onClick={() => getNotifications(lastVisibleId)}>
                                Load More
                            </button>
                        )}
                    </ol>
                )}
            </div>
        </div>
    );
};

export default Notifications; 