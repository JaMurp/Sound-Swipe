import React, { createContext, useContext, useEffect, useState } from 'react';
import { AuthContext } from './AuthContext';
import axios from 'axios';

export const FinishedProfileContext = createContext();

export const FinishProfileProvider = ({ children }) => {
    const [finishedProfile, setFinishedProfile] = useState(false);
    const [loading, setLoading] = useState(true);
    const { currentUser } = useContext(AuthContext);

    useEffect(() => {
        const fetchProfile = async () => {
            if (!currentUser) {
                setFinishedProfile(false);
                setLoading(false);
                return;
            }
            try {
                const res = await axios.get(`http://localhost:3000/api/users/find/${currentUser.uid}`);
                setFinishedProfile(res.data.success === true);
            } catch (error) {
                setFinishedProfile(false); 
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [currentUser]);

    return (
        <FinishedProfileContext.Provider value={{ finishedProfile, setFinishedProfile, loading }}>
            {children}
        </FinishedProfileContext.Provider>
    );
};




