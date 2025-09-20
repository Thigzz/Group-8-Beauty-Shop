import { useState, useEffect } from 'react'

function SecurityQuestions() {
  const [availableQuestions, setAvailableQuestions] = useState([])
  const [selectedQuestions, setSelectedQuestions] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    fetchAvailableQuestions()
  }, [])

  const fetchAvailableQuestions = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5000/api/security-questions/available')
      const data = await response.json()
      
      if (response.ok) {
        setAvailableQuestions(data.questions)
      } else {
        setError('Failed to load security questions')
      }
    } catch (err) {
      setError('Network error')
    }
  }

  const addQuestion = () => {
    if (selectedQuestions.length < 3) {
      setSelectedQuestions([...selectedQuestions, { question_id: '', answer: '' }])
    }
  }

  const removeQuestion = (index) => {
    setSelectedQuestions(selectedQuestions.filter((_, i) => i !== index))
  }

  const updateQuestion = (index, field, value) => {
    const updated = [...selectedQuestions]
    updated[index] = { ...updated[index], [field]: value }
    setSelectedQuestions(updated)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    // Get user ID from token (in real app, you'd decode the JWT)
    const token = localStorage.getItem('access_token')
    if (!token) {
      setError('Please login first')
      setLoading(false)
      return
    }

    // For demo purposes, using a placeholder user ID
    // In production, you'd get this from the decoded JWT token
    const userId = 'placeholder-user-id'

    try {
      const response = await fetch(`http://127.0.0.1:5000/api/security-questions/user/${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ questions: selectedQuestions })
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess('Security questions saved successfully!')
        setSelectedQuestions([])
      } else {
        setError(data.error || 'Failed to save security questions')
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
        <div style={{ width: '100%', maxWidth: '500px' }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Security Questions</h1>
          <p style={{ color: '#666', marginBottom: '2rem' }}>
            Set up security questions to help recover your account if you forget your password.
            You can set up to 3 questions.
          </p>
          
          {error && (
            <div style={{ backgroundColor: '#fee', color: '#c33', padding: '0.75rem', borderRadius: '4px', marginBottom: '1rem' }}>
              {error}
            </div>
          )}
          
          {success && (
            <div style={{ backgroundColor: '#efe', color: '#3c3', padding: '0.75rem', borderRadius: '4px', marginBottom: '1rem' }}>
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {selectedQuestions.map((sq, index) => (
              <div key={index} style={{ marginBottom: '1.5rem', padding: '1rem', border: '1px solid #ddd', borderRadius: '4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <label style={{ fontWeight: 'bold' }}>Question {index + 1}</label>
                  <button
                    type="button"
                    onClick={() => removeQuestion(index)}
                    style={{ background: 'none', border: 'none', color: '#c33', cursor: 'pointer', fontSize: '1.2rem' }}
                  >
                    ✕
                  </button>
                </div>
                
                <select
                  value={sq.question_id}
                  onChange={(e) => updateQuestion(index, 'question_id', e.target.value)}
                  required
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    marginBottom: '1rem'
                  }}
                >
                  <option value="">Select a question...</option>
                  {availableQuestions.map(q => (
                    <option key={q.id} value={q.id}>
                      {q.question}
                    </option>
                  ))}
                </select>
                
                <input
                  type="text"
                  placeholder="Your answer"
                  value={sq.answer}
                  onChange={(e) => updateQuestion(index, 'answer', e.target.value)}
                  required
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #ddd',
                    borderRadius: '4px'
                  }}
                />
              </div>
            ))}

            {selectedQuestions.length < 3 && (
              <button
                type="button"
                onClick={addQuestion}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  backgroundColor: '#f8f8f8',
                  color: '#666',
                  border: '1px dashed #ddd',
                  borderRadius: '4px',
                  fontSize: '1rem',
                  cursor: 'pointer',
                  marginBottom: '1rem'
                }}
              >
                + Add Security Question
              </button>
            )}

            {selectedQuestions.length > 0 && (
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
                {loading ? 'Saving...' : 'Save Security Questions'}
              </button>
            )}
          </form>

          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <a href="/login" style={{ color: '#666', textDecoration: 'none' }}>
              Back to Login
            </a>
          </div>
        </div>
      </div>

      <div style={{ flex: 1, backgroundImage: 'linear-gradient(45deg, #f0e6d2, #e8dcc0)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: '#8B7355' }}>
          <h2>Account Security</h2>
          <p>Protect your beauty journey</p>
        </div>
      </div>
    </div>
  )
}

export default SecurityQuestions
