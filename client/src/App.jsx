import React from 'react';
import {Route, Routes} from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import * as Middleware from './components/Middleware/Middleware.jsx'
import DashboardPage from './components/pages/private/DashboardPage.jsx';
import HomePage from './components/pages/public/HomePage.jsx';
import { Navigate } from 'react-router-dom';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Routes>
        
        {/* these are the public routes */}
        <Route path='/' element={< Middleware.PublicRoute />} >
          <Route path='/' element={< HomePage/>} />
        </Route>

        {/* thes are the private routes */}
        <Route path='/' element={< Middleware.PrivateRoute />} >
          <Route path='/dashboard' element={< DashboardPage/>} />
        </Route>

        <Route path='*' element={<Navigate to='/' />} />


      </Routes>
    </AuthProvider>
  );
}



export default App;
