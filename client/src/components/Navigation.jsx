import React, {useContext, useState} from 'react';
import {Link, NavLink} from 'react-router-dom';
import {AuthContext} from '../context/AuthContext';
import SignOutButton from './Private/SignOut';
import logo from '../assets/img/logo.png';

import settings from '../assets/img/settings.png'

import '../styles/Navigation.css';
import LoginModal from './Public/LoginModal';
import SettingsModal from './Private/Modals/SettingsModal'; 

// this is the naviagation component that decides what naviagation componennt to show based on if there is a current user
const Navigation = () => {

    const {currentUser} = useContext(AuthContext);
   return <div>{currentUser ? <NavigationAuth/> : 
    <NavigationNonAuth/>}</div>
};

// this is the navigation component for when there is a current user
const NavigationAuth = () => {
    const [open, setOpen] = useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    return (
        <nav>
            <Link to='/dashboard'>
                <img src={logo} alt='logo' className='logo' />
                <h1>Sound Swipe</h1>
            </Link>

            <NavLink to='/leaderboard'>Leaderboard</NavLink>
            
            <div className="right-items">
                <NavLink to='/profile'>Profile</NavLink>
                <Link to='/settings' onClick={handleOpen}>
                    <img src={settings} alt='settings' className='logo'/>
                </Link>
                <SettingsModal open={open} onClose={handleClose} />


                <SignOutButton/>
            </div>


        </nav>
    );
};

// this is the navigation component for when there is no current user
const NavigationNonAuth = () => {
    const [open, setOpen] = useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    return (
        <nav>
            <Link to='/'>
                <img src={logo} alt='logo' className='logo' />
                {/* <h1>Sound Swipe</h1> */}
            </Link>

            {/* <NavLink to='/leaderboard'>Leaderboard</NavLink> */}
            <NavLink to='/login'>
                <button onClick={handleOpen}>Login</button>
            </NavLink>

            <LoginModal open={open} onClose={handleClose} />
            {/* <NavLink to='/signup'>
                <button>Signup</button>
            </NavLink> */}
        </nav>
    );
};

export default Navigation;






