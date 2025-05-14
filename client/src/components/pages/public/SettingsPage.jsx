import React, { useEffect, useState } from "react";
import { Nav, Spinner, Modal } from 'react-bootstrap';
import LoadingSpinner from "../../common/LoadingSpinner";
import Switch from '@mui/material/Switch';
import { useAuth } from "../../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { doSignOut } from "../../../firebase/FirebaseFunctions";
import './SettingsPage.css';
import Avatar from '@mui/material/Avatar';
import { red } from '@mui/material/colors';
import { Button } from "@mui/material";

// Dark Theme Styles

const DeleteAccountModal = ({ open, onClose }) => {
    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(false);

    const { currentUser } = useAuth()

    const handleDeleteAccount = async () => {
        try {
            setLoading(true);
            const jwtToken = await currentUser.getIdToken();
            const { data } = await axios.delete('http://localhost:3000/api/users/profile', {
                headers: {
                    'Authorization': `Bearer ${jwtToken}`,
                    'Content-Type': 'application/json'
                }
            });
            if (!data.success) throw "Error deleting"
            await doSignOut();

        } catch (e) {
            setLoading(false);
            setError(e.message);
        }
    };

    if (loading) return <div><LoadingSpinner /></div>

    return (
        <Modal show={open} onHide={onClose} centered>
            {error && <div className="settings-error">{error}</div>}
            <Modal.Header closeButton>
                <Modal.Title>Delete Account</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p>This action cannot be undone. All your data will be permanently deleted.</p>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="outlined" onClick={onClose} sx={{marginRight: 1}}>Cancel</Button>
                <Button variant="contained" sx={{ background: red[500], color: "white", borderColor: red[500]}} onClick={handleDeleteAccount}>Delete Account</Button>
            </Modal.Footer>
        </Modal>
    );
};

// Account Settings Component
const AccountContent = () => {
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userData, setUserData] = useState(null);
    const [formData, setFormData] = useState(null);
    const { currentUser } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                if (!currentUser) {
                    navigate('/');
                    return;
                }

                const jwtToken = await currentUser.getIdToken();
                const { data } = await axios.get('http://localhost:3000/api/users/profile', {
                    headers: {
                        'Authorization': `Bearer ${jwtToken}`,
                        'Content-Type': 'application/json'
                    }
                });

                setUserData(data);
                setFormData(data);
                setLoading(false);
                setError(null);
            } catch (err) {
                console.error(err);
                setError(err.message);
                setLoading(false);
            }
        };
        fetchUserProfile();
    }, [currentUser, navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSave = async () => {
        try {
            if (!formData.username?.trim() || formData.username.trim().length > 15) {
                setError('Username is required and under 15 chars');
                return;
            }

            const changedFields = {};
            if (formData.username !== userData.username) {
                if (!formData.username) throw "Username is required";
                changedFields.username = formData.username.trim();

                if (changedFields.username.length < 3 || changedFields.username.length > 15) {
                    setError('Username must be between 3 and 15 characters');
                    return;
                }
                for (let i = 0; i < changedFields.username.length; i++) {
                    const char = changedFields.username[i];
                    const isLowercase = char >= "a" && char <= "z";
                    const isNumber = char >= "0" && char <= "9";
                    const isUnderscore = char === "_";
                    
                    if (!(isLowercase || isNumber || isUnderscore)) {
                        setError('Username can only contain lowercase letters, numbers, and underscores');
                        return;
                    }
                }

            }
            if (formData.bio !== userData.bio) {
                if (!formData.bio) throw "Bio is required";
                changedFields.bio = formData.bio?.trim() || '';
                if (changedFields.bio.length > 160) {
                    setError('Bio must be less than 160 characters');
                    return;
                }

            }

            // Check if any changes were made
            if (Object.keys(changedFields).length === 0) {
                setIsEditing(false);
                return;
            }

            setLoading(true);
            const jwtToken = await currentUser.getIdToken();
            console.log(changedFields)
            const { data } = await axios.patch(
                'http://localhost:3000/api/users/profile',
                changedFields,
                {
                    headers: {
                        'Authorization': `Bearer ${jwtToken}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (!data.success) {
                throw new Error(data.error || 'Failed to update profile');
            }

            setUserData(prev => ({
                ...prev,
                ...changedFields
            }));
            setIsEditing(false);
            setError(null);
        } catch (err) {
            setError(err.response.data.error || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        setFormData(userData);
        setIsEditing(false);
        setError(null);
    };

    if (loading) {
        return (
            <div>
                <LoadingSpinner />
            </div>
        );
    }

    return (
        <>
            <div className="settings-label">Account Settings</div>
            {error && (
                <div className="settings-error">
                    {error}
                </div>
            )}

            <div className="settings-form-container">
                <div className="settings-profile-pic">
                    {userData?.avatar_url ? (

                        <Avatar
                            alt="Profile"
                            src={userData.avatar_url}
                            sx={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                    ) : (
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="#8b949e">
                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                        </svg>
                    )}
                </div>

                <div className="settings-form-fields">
                    <div className="settings-form-field">
                        <div className="settings-field-label">Username*</div>
                        <input
                            className="settings-input"
                            type="text"
                            name="username"
                            value={formData?.username || ''}
                            onChange={handleChange}
                            disabled={!isEditing}
                            maxLength={30}
                        />

                        <div className="settings-input-helper">
                            This is your public display name
                        </div>
                    </div>

                    <div className="settings-form-field">
                        <div className="settings-field-label">Bio</div>
                        <textarea
                            className="settings-input settings-textarea"
                            name="bio"
                            value={formData?.bio || ''}
                            onChange={handleChange}
                            disabled={!isEditing}
                            placeholder="Tell us about yourself"
                            maxLength={160}
                        />
                        <div className="settings-input-helper">
                            {(formData?.bio?.length || 0)}/160 characters
                        </div>
                    </div>
                </div>
            </div>

            <div className="settings-action-bar">
                {!isEditing ? (

                    <Button
                        variant="contained"
                        onClick={() => setIsEditing(true)}
                    >
                        Edit Profile
                    </Button>

                ) : (
                    <>
                        {/* <button
                            className="settings-button settings-button-secondary"
                            onClick={handleCancel}
                        >
                            Cancel
                        </button>
                        <button
                            className="settings-button settings-button-primary"
                            onClick={handleSave}
                            disabled={loading}
                        >
                            {loading ? 'Saving...' : 'Save Changes'}
                        </button> */}
                        <Button
                            variant="outlined"
                            onClick={() => setIsEditing(false)}
                            sx={{ marginLeft: '8px' }}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="contained"
                            onClick={handleSave}
                            disabled={loading}
                            sx={{ marginLeft: '8px' }}
                        >
                            {loading ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </>
                )}
            </div>
        </>
    );
};


const SettingsContent = () => {
    const [explicitData, setExplicitData] = useState(null)
    const [showLikes, setShowLikes] = useState(null)
    const [showLikesOnProfile, setShowLikesOnProfile] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const { currentUser } = useAuth();
    const navigate = useNavigate();


    useEffect(() => {

        setLoading(true)
        setError(null)
        setShowLikesOnProfile(null)
        setShowLikes(null)
        setExplicitData(null)
        const getUserData = async () => {
            try {
                if (!currentUser) {
                    navigate('/')
                }

                const jwtToken = await currentUser.getIdToken();
                const { data } = await axios.get('http://localhost:3000/api/users/profile', {
                    headers: {
                        'Authorization': `Bearer ${jwtToken}`,
                        'Content-Type': 'application/json'
                    }
                });

                setExplicitData(data.explicitData)
                setShowLikes(data.showLikes)
                setShowLikesOnProfile(data.showLikesOnProfile)
                setLoading(false)

            } catch (e) {
                setError(e.message)
                setLoading(false);
            }

        };

        getUserData();
    }, [])

    if (loading) return <div><LoadingSpinner /></div>
    if (error) return <div className="settings-error">{error}</div>


    const toggleExplicitData = async () => {
            try {
                if (explicitData === null) throw "Explicit data is not set";
                if (typeof explicitData !== "boolean") throw "Explicit data is not a boolean";

                const idToken = await currentUser.getIdToken();
                const { data } = await axios.patch('http://localhost:3000/api/users/profile', 
                    {
                        explicitData: !explicitData
                    },
                    {
                        headers: {
                            'Authorization': `Bearer ${idToken}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );

            if (!data.success) {
                setError(data.error)
                return;
            }

            setExplicitData(!explicitData);
        } catch (e) {
            setError(e.message)
        }
    };

    const toggleShowLikes = async () => {
        try {
            if (showLikes === null) throw "Show likes is not set";
            if (typeof showLikes !== "boolean") throw "Show likes is not a boolean";

            const idToken = await currentUser.getIdToken();
            const { data } = await axios.patch('http://localhost:3000/api/users/profile',
                {
                    showLikes: !showLikes
                },
                {
                    headers: {
                        'Authorization': `Bearer ${idToken}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (!data.success) {
                setError(data.error)
                return;
            }

            setShowLikes(!showLikes);
        } catch (e) {
            setError(e.message)
        }
    };

    const toggleShowLikesOnProfile = async () => {
        try {
            if (showLikesOnProfile === null) throw "Show likes on profile is not set";
            if (typeof showLikesOnProfile !== "boolean") throw "Show likes on profile is not a boolean";

            const idToken = await currentUser.getIdToken();
            const { data } = await axios.patch('http://localhost:3000/api/users/profile',
                {
                    showLikesOnProfile: !showLikesOnProfile
                },
                {
                    headers: {
                        'Authorization': `Bearer ${idToken}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (!data.success) {
                setError(data.error)
                return;
            }

            setShowLikesOnProfile(!showLikesOnProfile);
        } catch (e) {
            setError(e.message)
        }
    };


    return (
        <>
            <div className="settings-label">Settings</div>
            <h2>Toggle Censored Data</h2>
            <div className="settings-field-value">
                {explicitData ? 'Explicit content enabled' : 'Explicit content disabled'}
            </div>
            <Switch
                checked={explicitData}
                onChange={toggleExplicitData}
            />
            <h2 style={{ marginTop: '24px' }}>Toggle Show Likes on Public Feed</h2>
            <div className="settings-field-value">
                {showLikes ? 'Likes are visible' : 'Likes are hidden'}
            </div>
            <Switch
                checked={showLikes}
                onChange={toggleShowLikes}
            />
            <h2 style={{ marginTop: '24px' }}>Toggle Show Likes on Profile</h2>
            <div className="settings-field-value">
                {showLikesOnProfile ? 'Profile likes are visible' : 'Profile likes are hidden'}
            </div>
            <Switch
                checked={showLikesOnProfile}
                onChange={toggleShowLikesOnProfile}
            />
            {error && <div className="settings-error">{error}</div>}
        </>
    );
};

// Delete Account Component
const DeleteContent = () => {
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    return (
        <>
            <div className="settings-label">Delete Account</div>
            <div className="settings-field-label">Warning</div>
            <div className="settings-field-value">
                This action cannot be undone. All your data will be permanently deleted.
            </div>

            {/* <button
                onClick={() => setShowDeleteModal(true)}
                className="settings-button settings-button-danger"
            >
                Delete Account
            </button> */}
            <Button
                variant="contained"

                onClick={() => setShowDeleteModal(true)}
                sx={{ background: red[500], color: "white", borderColor: red[500]}}
            >
                Delete Account
            </Button>

            <DeleteAccountModal
                open={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
            />
        </>
    );
};

// Main Settings Page Component
const SettingsPage = () => {
    const [activeKey, setActiveKey] = useState("account");

    return (
        <div className="settings-container">
            <div className="settings-sidebar">
                <Nav
                    className="flex-column"
                    activeKey={activeKey}
                    onSelect={(selectedKey) => setActiveKey(selectedKey)}
                >
                    <Nav.Link
                        eventKey="account"
                        className={`settings-nav-link ${activeKey === "account" ? "active" : ""}`}
                    >
                        Account
                    </Nav.Link>
                    <Nav.Link
                        eventKey="settings"
                        className={`settings-nav-link ${activeKey === "settings" ? "active" : ""}`}
                    >
                        Settings
                    </Nav.Link>
                    <Nav.Link
                        eventKey="delete"
                        className={`settings-nav-link ${activeKey === "delete" ? "active" : ""}`}
                    >
                        Delete Account
                    </Nav.Link>
                </Nav>
            </div>

            <div className="settings-main">
                {activeKey === "account" ? <AccountContent /> :
                    activeKey === "settings" ? <SettingsContent /> :
                        <DeleteContent />}
            </div>
        </div>
    );
};

export default SettingsPage;