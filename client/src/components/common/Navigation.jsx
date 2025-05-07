import React, { useEffect, useState } from "react";
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import Button from 'react-bootstrap/Button';
import LoginModalBootstrap from "./LoginModalBoostrap";
import { useNavigate } from "react-router-dom";
import { doSignOut } from '../../firebase/FirebaseFunctions';
import { useAuth } from "../../context/AuthContext";

export const PublicNavigation = () => {

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const handleModalClose = () => setIsLoginModalOpen(false)


  return (
    <Navbar expand="lg" className="bg-body-tertiary" data-bs-theme="dark" fixed="top">
      <Container>
        <Navbar.Brand href="/">Sound Swipe</Navbar.Brand>
        <Navbar.Toggle />
        <Navbar.Collapse>
          <Nav className="me-auto">
            <Nav.Link href="/">Home</Nav.Link>
          </Nav>

          <Nav>
            <LoginModalBootstrap isOpen={isLoginModalOpen} onClose={handleModalClose} /> 

            <Button onClick={() => setIsLoginModalOpen(true)} variant="outline-primary">Sign In</Button>
          </Nav>

        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export const PrivateNavigation = () => {
  const navigate= useNavigate()

  const handleLogout = async () => {
    try {
      await doSignOut()
      navigate("/")
    } catch(e) {
      console.error(e.message)
      alert(e)
    }
  }

  return (
    <Navbar expand="lg" className="bg-body-tertiary" data-bs-theme='dark' fixed='top'>
      <Container>
        <Navbar.Brand href="/">Sound Swipe</Navbar.Brand>
        <Navbar.Toggle />
        <Navbar.Collapse>
          <Nav className="me-auto">
            <Nav.Link href="/dashboard">Dashboard</Nav.Link>
            <Nav.Link href="/leaderboard">Leaderboard</Nav.Link>
          </Nav>

          <Nav>
            <Nav.Link href="/notifications">Notifications</Nav.Link>
          </Nav>

          <Nav>
            <NavDropdown title="Profile" align="end">
              <NavDropdown.Item href="/profile">Profile</NavDropdown.Item>
              <NavDropdown.Item href="/settings">Settings</NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item onClick={handleLogout}>Sign Out</NavDropdown.Item>
            </NavDropdown>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}