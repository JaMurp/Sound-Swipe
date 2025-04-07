import React, {useState} from 'react';
import { Modal, Box } from '@mui/material';
import SignUp from './SignUp';
import '../../styles/SignUp.css';

const SignUpModal = ({ open, onClose }) => {

    return (
        <>
         <Modal open={open} onClose={onClose}>
            <Box className="signup-form">
                <SignUp onSuccess={onClose} />
            </Box>
        </Modal>
        </>
    )
}   

export default SignUpModal;
