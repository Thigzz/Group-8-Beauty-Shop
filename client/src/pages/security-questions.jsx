import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchSecurityQuestions, saveSecurityQuestions } from '../redux/features/auth/authSlice';
import toast from 'react-hot-toast';

const SecurityQuestionsPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { 
    isAuthenticated, 
    securityQuestions, 
    securityQuestionsLoading, 
    savingSecurityQuestions 
  } = useSelector((state) => state.auth);

  const [answers, setAnswers] = useState([
    { question_id: '', answer: '' },
    { question_id: '', answer: '' },
    { question_id: '', answer: '' },
  ]);

  useEffect(() => {
    // Only fetch questions if the user is authenticated
    if (isAuthenticated) {
      dispatch(fetchSecurityQuestions());
    }
  }, [dispatch, isAuthenticated]);

  const handleQuestionChange = (index, questionId) => {
    const newAnswers = [...answers];
    newAnswers[index].question_id = questionId;
    setAnswers(newAnswers);
  };

  const handleAnswerChange = (index, answer) => {
    const newAnswers = [...answers];
    newAnswers[index].answer = answer;
    setAnswers(newAnswers);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validation
    const selectedIds = answers.map(a => a.question_id);
    if (new Set(selectedIds).size !== answers.length) {
      toast.error('Please select three unique security questions.');
      return;
    }
    if (answers.some(a => !a.question_id || !a.answer.trim())) {
      toast.error('Please select a question and provide an answer for all three fields.');
      return;
    }

    dispatch(saveSecurityQuestions(answers))
      .unwrap()
      .then(() => {
        toast.success('Security questions saved successfully!');
        navigate('/profile'); // Redirect to profile or dashboard after saving
      })
      .catch((error) => {
        toast.error(error || 'Failed to save security questions.');
      });
  };

  if (securityQuestionsLoading) {
    return <div className="text-center p-8">Loading security questions...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-lg shadow-md p-8">
        <h2 className="text-2xl font-bold text-center mb-6">Set Up Your Security Questions</h2>
        <p className="text-center text-gray-600 mb-8">
          These questions will help us verify your identity if you need to reset your password.
        </p>
        <form onSubmit={handleSubmit} className="space-y-6">
          {answers.map((_, index) => (
            <div key={index}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Question {index + 1}
              </label>
              <select
                value={answers[index].question_id}
                onChange={(e) => handleQuestionChange(index, e.target.value)}
                className="w-full p-3 border rounded-lg bg-white"
                required
              >
                <option value="">-- Select a Question --</option>
                {securityQuestions.map((q) => (
                  <option key={q.id} value={q.id}>
                    {q.question}
                  </option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Your Answer"
                value={answers[index].answer}
                onChange={(e) => handleAnswerChange(index, e.target.value)}
                className="w-full p-3 border rounded-lg mt-2"
                required
              />
            </div>
          ))}
          <button
            type="submit"
            disabled={savingSecurityQuestions}
            className="w-full bg-yellow-600 text-white py-3 rounded-lg font-semibold hover:bg-yellow-700 disabled:bg-gray-400"
          >
            {savingSecurityQuestions ? 'Saving...' : 'Save and Continue'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SecurityQuestionsPage;