import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import fbconfig from './firebase/FirebaseConfig.js'
import { initializeApp } from 'firebase/app'

const app = initializeApp(fbconfig)

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
      <App />
  </BrowserRouter>
)
