import React, {useState, useEffect, useContext} from 'react';
import {getAuth, onAuthStateChanged} from 'firebase/auth';
import app from '../firebase/FirebaseConfig';
import axios from 'axios';
import LoadingSpinner from '../components/common/LoadingSpinner';

export const AuthContext = React.createContext();

export const AuthProvider = ({children}) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const auth = getAuth(app);

  useEffect(() => {
    const myListener = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // User is signed in
        try {
          // Get the ID token
          const idToken = await user.getIdToken();
          console.log(user)
          
          // Make API call to your backend
          const {data }= await axios.post('http://localhost:3000/api/users/sync-user', {}, {
            headers: {
              'Authorization': `Bearer ${idToken}`,
              'Content-Type': 'application/json'
            }
          });

          console.log(data)

          if (data.success) {
            setCurrentUser(user);

          } else {
            throw new Error("Error with server");
          }
        } catch (error) {

          console.error('Error syncing profile:', error);
          await auth.signOut();
          setCurrentUser(null);
          window.location.href = '/';

        }
      } else {
        // User is signed out
        setCurrentUser(null);
      }
      setLoadingUser(false);
    });

    // Cleanup subscription
    return () => {
      if (myListener) myListener();
    };
  }, [auth]);

  if (loadingUser) {
    return (
      <div>
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{currentUser}}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};