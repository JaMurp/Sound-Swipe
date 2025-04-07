import {Navigate, Outlet} from 'react-router-dom';
import React, {useContext} from 'react';
import {AuthContext} from '../context/AuthContext';
import { FinishedProfileContext } from '../context/FinishedProfileContext';


const PrivateRoute = () => {
  const { currentUser } = useContext(AuthContext);
  const { finishedProfile, loading } = useContext(FinishedProfileContext);

  if (loading) return <div>Loading...</div>;

  if (!currentUser) return <Navigate to='/signup' replace />;
  if (!finishedProfile) return <Navigate to='/setup-profile' replace />;

  return <Outlet />;
};


export default PrivateRoute;


