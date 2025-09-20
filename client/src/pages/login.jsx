import { useState } from 'react'

function Login() {
  const [formData, setFormData] = useState({
    login_identifier: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('http://127.0.0.1:5000/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          login_identifier: formData.login_identifier,
          password: formData.password,
          session_id: localStorage.getItem('session_id')
        })
      })

      const data = await response.json()

      if (response.ok) {
        localStorage.setItem('access_token', data.access_token)
        console.log('Login successful!', data)
        alert('Login successful!')
      } else {
        setError(data.message || 'Login failed')
      }
    } catch (err) {
      setError('Network error. Please try again.')
      console.error('Login error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <div style={{ flex: 1, padding: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '100%', maxWidth: '400px' }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Welcome back!</h1>
          <p style={{ color: '#666', marginBottom: '2rem' }}>Enter your Credentials to access your account</p>
          
          {error && (
            <div style={{ backgroundColor: '#fee', color: '#c33', padding: '0.75rem', borderRadius: '4px', marginBottom: '1rem' }}>
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Username/ Email address</label>
              <input
                type="text"
                name="login_identifier"
                placeholder="Enter your username or email"
                value={formData.login_identifier}
                onChange={handleChange}
                disabled={loading}
                required
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '1rem'
                }}
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={loading}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '1rem'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    border: 'none',
                    background: 'none',
                    cursor: 'pointer'
                  }}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '0.75rem',
                backgroundColor: loading ? '#ccc' : '#8B7355',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '1rem',
                cursor: loading ? 'not-allowed' : 'pointer',
                marginBottom: '1rem'
              }}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>

            <div style={{ textAlign: 'center' }}>
              <a href="/forgot-password" style={{ color: '#666', textDecoration: 'none' }}>
                forgot password
              </a>
            </div>
          </form>

          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <span>Don't have an account? </span>
            <a href="/register" style={{ color: '#8B7355', textDecoration: 'none' }}>Sign Up</a>
          </div>
        </div>
      </div>

      <div style={{ 
        flex: 1, 
        backgroundImage: 'linear-gradient(45deg, #f0e6d2, #e8dcc0)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center', color: '#8B7355' }}>
          <h2>PAMBO Beauty</h2>
          <p>Premium Beauty Essentials</p>
        </div>
      </div>
    </div>
  )
}

export default Login
