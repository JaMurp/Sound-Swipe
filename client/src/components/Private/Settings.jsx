import React,{useState, useEffect, useContext} from 'react';
import { AuthContext } from '../../context/AuthContext';
import { deleteUser, getIdToken } from 'firebase/auth';
import axios from 'axios';
import Switch from './Switch/Switch';

const Settings = ({ onSuccess }) => {

const {currentUser} = useContext(AuthContext);

const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);
const [underAge, setUnderAge] = useState(null)
const [explicity, setExplicity] = useState(undefined);


    // retreives the settings
    useEffect(()=> {

        setLoading(true);
        setError(null);
        setExplicity(undefined);

        const fetchSettings = async () => {
            const idToken = await currentUser.getIdToken()

            // tries to get the setttings from backened 
            try {
                const res = await axios.get('http://localhost:3000/api/users/settings', {
                    headers: {
                        Authorization: `Bearer ${idToken}`
                    }
                });
                if (!res.data.success) throw "Error: Getting Settings";

                setUnderAge( res.data.settings.underAge);
                setExplicity(res.data.settings.explicity)

                setLoading(false);

            } catch(e) {
                setError(e);
                setLoading(false)
                return;
            } 

        };

        fetchSettings()
    }, [])

    const handleExplicity = async () => {
        setLoading(true);
        setError(null);
        setExplicity(undefined);

        const idToken = await currentUser.getIdToken()

        try {
             const res = await axios.post('http://localhost:3000/api/users/explicity', {},{
                    headers: {
                        Authorization: `Bearer ${idToken}`
                    }
                });
                if (!res.data.success) throw "Error updating";

                setExplicity(res.data.updateExplicity);
                setLoading(false);
        } catch(e) {
            setError(e.data);
            setLoading(false)
            return 
        }
    }

    if (loading) {
        return(
            <div>
                <h1>LOADING SETTINGS...</h1>
            </div>
        )
    } else {
            return (
                <div>
                    {error && <h2>{error}</h2>}
                    <p>Settings</p>

                    {(underAge !== undefined && !underAge) && (
                        <div className="settings-option">
                            <div className="settings-option-label">
                                <h3>Toggle Censor Data</h3>
                            </div>
                            <Switch
                                isOn={explicity}
                                handleToggle={handleExplicity}
                            />
                        </div>
                    )}
                </div>
        )
    }
};

export default Settings;