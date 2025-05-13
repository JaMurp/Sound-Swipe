import React from 'react';
import {Route, Routes} from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import * as Middleware from './components/Middleware/Middleware.jsx'
import DashboardPage from './components/pages/private/DashboardPage.jsx';
import HomePage from './components/pages/public/HomePage.jsx';
import { Navigate } from 'react-router-dom';
import './App.css';
import ProfilePage from './components/pages/public/ProfilePage.jsx';
import SettingsPage from './components/pages/public/SettingsPage.jsx';
import FriendsPage from './components/pages/private/FriendsPage.jsx';
import Leaderboard from './components/pages/private/Leaderboard.jsx';
import FeedPage from './components/pages/public/FeedPage.jsx';
import LikedSongsPage from './components/pages/private/LikedSongsPage.jsx';
import Notifications from './components/pages/private/Notifications.jsx';
import LiveFeed from './components/pages/private/LiveFeed.jsx';
function App() {

  return (
    <AuthProvider>  
      <Routes>
        
        {/* these are the public routes */}
        <Route path='/' element={< Middleware.PublicRoute />} >
          <Route path='/' element={< HomePage/>} />
        </Route>

        {/* thes are the private routes */}
        <Route path='/' element={< Middleware.PrivateRoute />} >
          <Route path='/dashboard' element={< DashboardPage/>} />
          <Route path='/profile' element={<ProfilePage />} />
          <Route path='/profile/:userId' element={<ProfilePage />} />
          <Route path='/settings' element={<SettingsPage />} />
          <Route path='/friends/:userId' element={<FriendsPage />} />
          <Route path='/leaderboard' element={<Leaderboard />} />
          <Route path='/notifications' element={<Notifications />} />
          <Route path='/feed' element={<FeedPage />} />
          <Route path='/likes' element={<LikedSongsPage />} />
          <Route path='/live-feed' element={<LiveFeed />} />
        </Route>

        <Route path='*' element={<Navigate to='/' />} />

      </Routes>
    </AuthProvider>
  );
}



export default App;
