import React from 'react';
import {useState, useEffect} from 'react';
import {getAuth, onAuthStateChanged} from 'firebase/auth';

export const AuthContext = React.createContext();

export const AuthProvider = ({children}) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const auth = getAuth();

    useEffect(() => {
        let myListener = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user);
            setLoading(false);
        });

        return () => {
            if (myListener) myListener();
            
        };
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <AuthContext.Provider value={{currentUser}}>{children}</AuthContext.Provider>
    );
};






