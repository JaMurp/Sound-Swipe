import React, { useState } from 'react';
import { Modal, Box } from '@mui/material';
import Login from './Login';
import SignUpModal from './SignUpModal';
import '../../styles/Login.css';
import '../../styles/SignUp.css';


const LoginModal = ({ open, onClose }) => {
  const [showSignUp, setShowSignUp] = useState(false);

  const handleSignUpOpen = () => {
    setShowSignUp(true);
    onClose();
  };

  return (
    <>
      <Modal open={open} onClose={onClose}>
        <Box className="login-form">
          <Login onSuccess={onClose} onSignUpClick={handleSignUpOpen} />
        </Box>
      </Modal>
      <SignUpModal open={showSignUp} onClose={() => setShowSignUp(false)} />
    </>
  );
};

export default LoginModal;
