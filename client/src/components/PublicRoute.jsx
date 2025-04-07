import {Navigate, Outlet} from 'react-router-dom';
import React, {useContext} from 'react';
import {AuthContext} from '../context/AuthContext';


const PublicRoute = () => {
    const {currentUser} = useContext(AuthContext);
    return currentUser ? <Navigate to='/dashboard' /> : <Outlet/>;
};

export default PublicRoute; 