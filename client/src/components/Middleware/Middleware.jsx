import {Navigate, Outlet} from 'react-router-dom';
import React, {useContext} from 'react';
import { AuthContext } from '../../context/AuthContext';
import { PublicNavigation, PrivateNavigation } from '../common/Navigation';

export const PrivateRoute = () => {
  const {currentUser} = useContext(AuthContext);
  return currentUser ? (
    <>
      <PrivateNavigation />
      <Outlet />
    </>
  ) : <Navigate to='/' replace={true} />;
};

export const PublicRoute = () => {
  const {currentUser} = useContext(AuthContext)
  return !currentUser ? (
    <>
      <PublicNavigation />
      <Outlet />
    </>
  ) : <Navigate to='/dashboard' replace={true} />;
};
