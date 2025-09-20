import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Login from './pages/login'
import Register from './pages/register'
import ForgotPassword from './pages/forgot-password'
import SecurityQuestions from './pages/security-questions'
import './App.css'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/security-questions" element={<SecurityQuestions />} />
        <Route path="/" element={
          <div style={{ padding: '2rem', textAlign: 'center' }}>
            <h1>Welcome to PAMBO</h1>
            <p>Your Premium Beauty Destination</p>
            <div style={{ marginTop: '2rem' }}>
              <a href="/login" style={{ margin: '0 1rem', color: '#8B7355' }}>Login</a>
              <a href="/register" style={{ margin: '0 1rem', color: '#8B7355' }}>Register</a>
            </div>
          </div>
        } />
      </Routes>
    </Router>
  )
}

export default App
