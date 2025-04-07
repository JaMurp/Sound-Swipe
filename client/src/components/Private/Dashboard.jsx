import React, {useState, useEffect, useContext} from 'react';
import FinishProfile from './FinishProfile.jsx';
import axios from 'axios';
import Loading from '../Loading.jsx';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [isSetUp, setIsSetup] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const {currentUser} = useContext(AuthContext);

    useEffect(() => {

        if (!currentUser) return;

        //setIsSetup(false);
        setLoading(true);
        setError(null);

        const accountSetUp = async () => {
            let validUid
            try {
                validUid = await axios.get('http://localhost:3000/api/users/find/' + currentUser.uid);
            } catch(e) {
                setError(e);
                console.log(e);
            }

            if (!validUid.data.success) {
                navigate('/setup-profile')

            }
            
            //setIsSetup(validUid.data.success);
            setLoading(false);
        }
        accountSetUp()
    }, [currentUser]);

    if (loading) {
        <>
            <Loading />
        </>
    }
    else {
        return (
            <>
                <div>
                    {error && <h2>{error}</h2>}
                    <h1>This is the dashboard</h1>
                </div>
            </>
        )
    }
}

export default Dashboard;