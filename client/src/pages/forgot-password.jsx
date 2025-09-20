import { useState } from 'react'

function ForgotPassword() {
  const [step, setStep] = useState(1) // 1: enter email, 2: answer questions, 3: reset password
  const [formData, setFormData] = useState({
    login_identifier: '',
    answers: [],
    new_password: '',
    confirm_password: ''
  })
  const [questions, setQuestions] = useState([])
  const [resetToken, setResetToken] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleAnswerChange = (questionId, answer) => {
    const updatedAnswers = formData.answers.filter(a => a.question_id !== questionId)
    updatedAnswers.push({ question_id: questionId, answer })
    setFormData({ ...formData, answers: updatedAnswers })
  }

  const getSecurityQuestions = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('http://127.0.0.1:5000/auth/reset-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ login_identifier: formData.login_identifier })
      })

      const data = await response.json()

      if (response.ok) {
        setQuestions(data)
        setStep(2)
      } else {
        setError(data.message || 'User not found')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const verifyAnswers = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('http://127.0.0.1:5000/auth/verify-answers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          login_identifier: formData.login_identifier,
          answers: formData.answers
        })
      })

      const data = await response.json()

      if (response.ok) {
        setResetToken(data.reset_token)
        setStep(3)
      } else {
        setError(data.message || 'Incorrect answers')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const resetPassword = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (formData.new_password !== formData.confirm_password) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    try {
      const response = await fetch('http://127.0.0.1:5000/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: resetToken,
          new_password: formData.new_password
        })
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess('Password reset successfully! You can now login with your new password.')
        setStep(4)
      } else {
        setError(data.message || 'Password reset failed')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <div style={{ flex: 1, padding: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '100%', maxWidth: '400px' }}>
          
          {step === 1 && (
            <>
              <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Reset Password</h1>
              <p style={{ color: '#666', marginBottom: '2rem' }}>Enter your username or email to get your security questions</p>
              
              {error && (
                <div style={{ backgroundColor: '#fee', color: '#c33', padding: '0.75rem', borderRadius: '4px', marginBottom: '1rem' }}>
                  {error}
                </div>
              )}

              <form onSubmit={getSecurityQuestions}>
                <input
                  type="text"
                  name="login_identifier"
                  placeholder="Username or email"
                  value={formData.login_identifier}
                  onChange={handleInputChange}
                  required
                  disabled={loading}
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '4px', marginBottom: '1rem' }}
                />
                
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
                    cursor: loading ? 'not-allowed' : 'pointer'
                  }}
                >
                  {loading ? 'Finding User...' : 'Get Security Questions'}
                </button>
              </form>
            </>
          )}

          {step === 2 && (
            <>
              <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Security Questions</h1>
              <p style={{ color: '#666', marginBottom: '2rem' }}>Answer your security questions to reset your password</p>
              
              {error && (
                <div style={{ backgroundColor: '#fee', color: '#c33', padding: '0.75rem', borderRadius: '4px', marginBottom: '1rem' }}>
                  {error}
                </div>
              )}

              <form onSubmit={verifyAnswers}>
                {questions.map((q, index) => (
                  <div key={q.id} style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                      {q.question}
                    </label>
                    <input
                      type="text"
                      placeholder="Your answer"
                      onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                      required
                      disabled={loading}
                      style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '4px' }}
                    />
                  </div>
                ))}
                
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
                    cursor: loading ? 'not-allowed' : 'pointer'
                  }}
                >
                  {loading ? 'Verifying...' : 'Verify Answers'}
                </button>
              </form>
            </>
          )}

          {step === 3 && (
            <>
              <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>New Password</h1>
              <p style={{ color: '#666', marginBottom: '2rem' }}>Enter your new password</p>
              
              {error && (
                <div style={{ backgroundColor: '#fee', color: '#c33', padding: '0.75rem', borderRadius: '4px', marginBottom: '1rem' }}>
                  {error}
                </div>
              )}

              <form onSubmit={resetPassword}>
                <input
                  type="password"
                  name="new_password"
                  placeholder="New password"
                  value={formData.new_password}
                  onChange={handleInputChange}
                  required
                  disabled={loading}
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '4px', marginBottom: '1rem' }}
                />
                
                <input
                  type="password"
                  name="confirm_password"
                  placeholder="Confirm new password"
                  value={formData.confirm_password}
                  onChange={handleInputChange}
                  required
                  disabled={loading}
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '4px', marginBottom: '1rem' }}
                />
                
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
                    cursor: loading ? 'not-allowed' : 'pointer'
                  }}
                >
                  {loading ? 'Resetting...' : 'Reset Password'}
                </button>
              </form>
            </>
          )}

          {step === 4 && (
            <>
              <div style={{ backgroundColor: '#efe', color: '#3c3', padding: '0.75rem', borderRadius: '4px', marginBottom: '1rem' }}>
                {success}
              </div>
              <a href="/login" style={{ color: '#8B7355', textDecoration: 'none', fontSize: '1.1rem' }}>
                Go to Login →
              </a>
            </>
          )}

          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <a href="/login" style={{ color: '#666', textDecoration: 'none' }}>
              Back to Login
            </a>
          </div>
        </div>
      </div>

      <div style={{ flex: 1, backgroundImage: 'linear-gradient(45deg, #f0e6d2, #e8dcc0)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: '#8B7355' }}>
          <h2>Secure Reset</h2>
          <p>Your account security matters</p>
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword
