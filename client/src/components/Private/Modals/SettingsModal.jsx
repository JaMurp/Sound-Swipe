import React, { useEffect, useState, useContext } from 'react';
import '../../../styles/Settings.css';
import Settings from '../Settings';
import { AuthContext } from '../../../context/AuthContext';

const SettingsModal = ({ open, onClose }) => {
    const currentUser = useContext(AuthContext);


    if (!open) return

        return (
            <>
                <div className="settings-modal-overlay" onClick={onClose} />
                <div className="settings-modal">
                    <div className="settings-header">
                        <h2>👋 {currentUser.currentUser.displayName}</h2>
                    </div>
                    <div className="settings-content">
                        <Settings onSuccess={onClose} />
                    </div>
                    <div className="settings-footer">
                        <button className="cancel-button" onClick={onClose}>
                            Cancel
                        </button>
                    </div>
                </div>
            </>
        );
};

export default SettingsModal;

