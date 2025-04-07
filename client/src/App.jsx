import './App.css'
import {AuthProvider} from './context/AuthContext';
import {Routes, Route} from 'react-router-dom';
import {Navigate} from 'react-router-dom';

// components
import PrivateRoute from './components/PrivateRoute.jsx';
import PublicRoute from './components/PublicRoute.jsx';
import Navigation from './components/Navigation.jsx';
import Home from './components/Public/Home.jsx';
import Leaderboard from './components/Leaderboard.jsx';
import Profile from './components/Private/Profile.jsx';
import SignOut from './components/Private/SignOut.jsx';
import Dashboard from './components/Private/Dashboard.jsx';
import FinishProfile from './components/Private/FinishProfile.jsx';
import { FinishProfileProvider } from './context/FinishedProfileContext.jsx';
import FinishProfileGuard from './components/FinishProfileGuard.jsx';
import Settings from './components/Private/Settings.jsx';



// this is the main app component 
const App = () => {
  return (
    <AuthProvider>
      <FinishProfileProvider>
        <div>
          {/* this is the header component */}
          <header>
            <Navigation/>
          </header>

          {/* this is the routes component */}
          <Routes>

            {/* public routes */}
            <Route element={<PublicRoute/>}>
              <Route path='/' element={<Home/>} />
            </Route>

           <Route element={<PrivateRoute />}>
              <Route path='/dashboard' element={<Dashboard />} />
              <Route path='/signout' element={<SignOut />} />
              <Route path='/profile' element={<Profile />} />
              <Route path='/leaderboard' element={<Leaderboard/>} />
              {/* <Route path='/settings' element={<Settings/>} /> */}
            </Route>

          <Route element={<FinishProfileGuard/>}>
              <Route path='/setup-profile' element={<FinishProfile />} />
          </Route>


            {/* <Route path='/leaderboard' element={<Leaderboard/>} /> */}

            {/* catch all route */}
            <Route path='*' element={<Navigate to='/' />} />
            
          </Routes>

        </div>

      </FinishProfileProvider>
    </AuthProvider>
  )
}

export default App
