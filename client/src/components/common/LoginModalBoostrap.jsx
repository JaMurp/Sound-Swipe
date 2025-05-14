import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Modal, Button } from 'react-bootstrap'
import { doSocialSignIn } from '../../firebase/FirebaseFunctions'


const LoginModalBootstrap = ({ isOpen, onClose }) => {
  const [agreedToTerms, setAgreedToTerms] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  const handleGoogleSignIn = async () => {
    try {
      await doSocialSignIn()
      navigate('/dashboard')
    } catch (e) {
      setError(e.message)
    }
  }

  return (
    <Modal show={isOpen} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Sign in to Sound Swipe</Modal.Title>
      </Modal.Header>
      {error && (
        <div>
          {error}
        </div>
      )}
      <Modal.Body>
        <div className="login-options">
          {agreedToTerms ? (
            <>
              <Button
                variant="outline-dark"
                className="w-100 mb-2 d-flex align-items-center justify-content-center"
                onClick={handleGoogleSignIn}
              >
                <img
                  src="https://www.google.com/favicon.ico"
                  alt="Google"
                  style={{ marginRight: '10px', width: '20px', height: '20px' }}
                />
                Sign in with Google
              </Button>
            </>
          ) : (
            <div className="text-center text-muted py-3">
              Please accept the terms to enable sign in
            </div>
          )}
        </div>

        <div className="mt-3">
          <div className="form-check">
            <input
              type="checkbox"
              className="form-check-input"
              id="termsCheckbox"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
            />
            <label className="form-check-label" htmlFor="termsCheckbox">
              I've read and agree to the{' '}
              <a
                href="/tos"
                target="_blank"
                rel="noopener noreferrer"
                className="text-decoration-none"
              >
                terms
              </a>
            </label>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  )
}

export default LoginModalBootstrap;