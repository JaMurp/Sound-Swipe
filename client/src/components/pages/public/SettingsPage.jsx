import React, { useEffect, useState } from "react";
import { Nav, Spinner, Modal, Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGithub, faTwitter, faLinkedin } from '@fortawesome/free-brands-svg-icons';
import LoadingSpinner from "../../common/LoadingSpinner";
import Switch from '@mui/material/Switch';
import { useAuth } from "../../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { doSignOut } from "../../../firebase/FirebaseFunctions";

// Dark Theme Styles
const darkStyles = {
    sidebarStyle: {
        width: "220px",
        background: "#0d1117",
        padding: "0",
        borderRight: "1px solid #30363d",
        boxSizing: "border-box",
        flex: "0 0 auto"
    },
    navLinkStyle: {
        padding: "16px 24px",
        fontSize: "16px",
        fontWeight: 400,
        color: "#c9d1d9",
        cursor: "pointer",
        borderLeft: "4px solid transparent",
    },
    navLinkActiveStyle: {
        fontWeight: 700,
        color: "#58a6ff",
        background: "#161b22",
        borderLeft: "4px solid #58a6ff",
    },
    containerStyle: {
        display: "flex",
        background: "#0d1117",
        height: "calc(100vh - 50px)",
        overflow: "hidden",
        fontFamily: "Inter, system-ui, -apple-system, sans-serif",
    },
    mainStyle: {
        flex: 1,
        background: "#161b22",
        margin: "16px",
        border: "1px solid #30363d",
        borderRadius: "6px",
        padding: "32px 48px",
        overflowY: "auto",
        height: "calc(100vh - 82px)"
    },
    labelStyle: {
        fontWeight: 600,
        fontSize: "24px",
        marginBottom: "24px",
        color: "#ffffff"
    },
    fieldLabelStyle: {
        fontWeight: 600,
        fontSize: "16px",
        marginTop: "16px",
        marginBottom: "4px",
        color: "#ffffff"
    },
    fieldValueStyle: {
        fontSize: "16px",
        marginBottom: "12px",
        color: "#c9d1d9"
    },
    inputStyle: {
        width: "100%",
        padding: "6px 10px",
        fontSize: "14px",
        border: "1px solid #30363d",
        borderRadius: "4px",
        background: "#21262d",
        color: "#c9d1d9"
    },
    buttonStyle: {
        padding: "8px 24px",
        borderRadius: "4px",
        cursor: "pointer",
        fontWeight: 500,
        fontSize: "16px",
        marginRight: "12px",
    },
    profilePicStyle: {
        width: "120px",
        height: "120px",
        borderRadius: "50%",
        backgroundColor: "#21262d",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        border: "2px solid #30363d",
        overflow: "hidden",
    },
    inputHelperText: {
        fontSize: '12px',
        color: '#8b949e',
        marginTop: '2px',
    },
    errorStyle: {
        color: 'white', 
        padding: '12px 16px', 
        backgroundColor: '#3d1c24',
        borderRadius: '4px',
        marginBottom: '24px',
        border: '1px solid #f5c6cb33'
    }
};

const DeleteAccountModal = ({ open, onClose }) => {
    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(false);

    const {currentUser} = useAuth()

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

        } catch(e){
            setLoading(false);
            setError(e.message);
        }
    };

    if (loading) return <div><LoadingSpinner /></div>

    return (
        <Modal show={open} onHide={onClose} centered>
            {error && <div>{error}</div>}
            <Modal.Header closeButton>
                <Modal.Title>Delete Account</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p>This action cannot be undone. All your data will be permanently deleted.</p>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onClose}>Cancel</Button>
                <Button variant="danger" onClick={handleDeleteAccount}>Delete Account</Button>
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
                changedFields.username = formData.username.trim();
            }
            if (formData.bio !== userData.bio) {
                changedFields.bio = formData.bio?.trim() || '';
            }

            // Check if any changes were made
            if (Object.keys(changedFields).length === 0) {
                setIsEditing(false);
                return;
            }

            setLoading(true);
            const jwtToken = await currentUser.getIdToken();
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
            setError(err.error);
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
            <div style={darkStyles.labelStyle}>Account Settings</div>
            {error && (
                <div style={darkStyles.errorStyle}>
                    {error}
                </div>
            )}

            <div style={{ display: 'flex', gap: '24px', marginBottom: '24px' }}>
                {/* Profile Picture Section */}
                <div style={darkStyles.profilePicStyle}>
                    {userData?.avatar_url ? (
                        <img
                            src={userData.avatar_url}
                            alt="Profile"
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                    ) : (
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="#8b949e">
                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                        </svg>
                    )}
                </div>

                {/* Form Fields */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {/* Username Field */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <div style={darkStyles.fieldLabelStyle}>Username*</div>
                        <input
                            style={darkStyles.inputStyle}
                            type="text"
                            name="username"
                            value={formData?.username || ''}
                            onChange={handleChange}
                            disabled={!isEditing}
                            maxLength={30}
                        />
                        <div style={darkStyles.inputHelperText}>
                            This is your public display name
                        </div>
                    </div>

                    {/* Bio Field */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <div style={darkStyles.fieldLabelStyle}>Bio</div>
                        <textarea
                            style={{
                                ...darkStyles.inputStyle,
                                minHeight: '100px',
                                resize: 'vertical'
                            }}
                            name="bio"
                            value={formData?.bio || ''}
                            onChange={handleChange}
                            disabled={!isEditing}
                            placeholder="Tell us about yourself"
                            maxLength={160}
                        />
                        <div style={darkStyles.inputHelperText}>
                            {(formData?.bio?.length || 0)}/160 characters
                        </div>
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div style={{
                position: "sticky",
                bottom: "0",
                background: "#161b22",
                padding: "12px 0",
                borderTop: "1px solid #30363d",
                marginTop: "24px",
                display: "flex",
                gap: "8px",
                justifyContent: "flex-end"
            }}>
                {!isEditing ? (
                    <button
                        style={{
                            ...darkStyles.buttonStyle,
                            background: "#58a6ff",
                            color: "white",
                            border: "none",
                            padding: "6px 16px",
                        }}
                        onClick={() => setIsEditing(true)}
                    >
                        Edit Profile
                    </button>
                ) : (
                    <>
                        <button
                            style={{
                                ...darkStyles.buttonStyle,
                                background: "#21262d",
                                color: "#c9d1d9",
                                border: "1px solid #30363d",
                                padding: "6px 16px",
                            }}
                            onClick={handleCancel}
                        >
                            Cancel
                        </button>
                        <button
                            style={{
                                ...darkStyles.buttonStyle,
                                background: "#58a6ff",
                                color: "white",
                                border: "none",
                                padding: "6px 16px",
                            }}
                            onClick={handleSave}
                            disabled={loading}
                        >
                            {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </>
                )}
            </div>
        </>
    );
};


const SettingsContent = () => {
    const [explicitData, setExplicitData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const {currentUser} = useAuth(); 
    const navigate = useNavigate();


    useEffect(() => {
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
                setLoading(false)

            } catch(e) {
                setError(e.message)
                setLoading(false);
            }

        };

        getUserData();
    }, [])

    if (loading) return <div><LoadingSpinner /></div>
    if (error) return <div style={darkStyles.errorStyle}>{error}</div>


    const toggleExplicitData = async () => {
            try {
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

                if (!data.success){
                    setError(data.error)
                    return;
                } 

                setExplicitData(!explicitData);
            } catch(e) {
                setError(e.message)
            }
    };


    return (
        <>
            <div style={darkStyles.labelStyle}>Settings</div>
            <h2>Toggle Censored Data</h2>
            <div style={darkStyles.fieldValueStyle}>
                {explicitData ? 'Explicit content enabled' : 'Explicit content disabled'}
            </div>
            <Switch 
                checked={explicitData} 
                onChange={toggleExplicitData}
            />
            {error && <div style={darkStyles.errorStyle}>{error}</div>}
        </>
    );
};

// Delete Account Component
const DeleteContent = () => {
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    return (
        <>
            <div style={darkStyles.labelStyle}>Delete Account</div>
            <div style={darkStyles.fieldLabelStyle}>Warning</div>
            <div style={darkStyles.fieldValueStyle}>
                This action cannot be undone. All your data will be permanently deleted.
            </div>
            
            <button 
                onClick={() => setShowDeleteModal(true)}
                style={{
                    ...darkStyles.buttonStyle,
                    background: "#ff4444",
                    color: "white",
                    border: "none",
                }}
            >
                Delete Account
            </button>

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
        <div style={darkStyles.containerStyle}>
            {/* Sidebar Navigation */}
            <div style={darkStyles.sidebarStyle}>
                <Nav 
                    className="flex-column" 
                    activeKey={activeKey}
                    onSelect={(selectedKey) => setActiveKey(selectedKey)}
                >
                    <Nav.Link 
                        eventKey="account" 
                        style={{
                            ...darkStyles.navLinkStyle,
                            ...(activeKey === "account" ? darkStyles.navLinkActiveStyle : {})
                        }}
                    >
                        Account
                    </Nav.Link>
                    <Nav.Link 
                        eventKey="settings" 
                        style={{
                            ...darkStyles.navLinkStyle,
                            ...(activeKey === "settings" ? darkStyles.navLinkActiveStyle : {})
                        }}
                    >
                       Settings 
                    </Nav.Link>
                    <Nav.Link 
                        eventKey="delete" 
                        style={{
                            ...darkStyles.navLinkStyle,
                            ...(activeKey === "delete" ? darkStyles.navLinkActiveStyle : {})
                        }}
                    >
                        Delete Account
                    </Nav.Link>
                </Nav>
            </div>

            {/* Main Content Area */}
            <div style={darkStyles.mainStyle}>
                {activeKey === "account" ? <AccountContent /> :
                 activeKey === "settings" ? <SettingsContent/> :
                 <DeleteContent />}
            </div>
        </div>
    );
};

export default SettingsPage;