import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import LandingPage from './pages/LandingPage';
import SearchResultsPage from './pages/SearchResultsPage';
import ProfilePage from './pages/ProfilePage';
import LoginPage from './pages/LoginPage';
import './App.css';

function App() {
  return (
    <Router>
      <Toaster
        position="top-center"
        reverseOrder={false}
        toastOptions={{
          success: {
            style: {
              background: '#28a745',
              color: 'white',
            },
          },
          error: {
            style: {
              background: '#dc3545',
              color: 'white',
            },
          },
        }}
      />
      <div className="App">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/search" element={<SearchResultsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;