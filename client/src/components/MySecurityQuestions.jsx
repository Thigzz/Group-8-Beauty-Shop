import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { saveSecurityQuestions, fetchUserProfile, fetchSecurityQuestions, fetchUserSecurityQuestions } from '../redux/features/auth/authSlice';
import toast from 'react-hot-toast';

const MySecurityQuestions = () => {
  const dispatch = useDispatch();
  const { 
    user, 
    securityQuestions, 
    userSecurityQuestions, 
    profileLoading,
    securityQuestionsLoading,
    savingSecurityQuestions,
    error 
  } = useSelector((state) => state.auth);

  const [questions, setQuestions] = useState([
    { question_id: '', question: '', answer: '' },
    { question_id: '', question: '', answer: '' },
    { question_id: '', question: '', answer: '' }
  ]);

  const [isEditing, setIsEditing] = useState(false);
  const [existingQuestions, setExistingQuestions] = useState([]);
  const [showAnswers, setShowAnswers] = useState({});
  const [initialized, setInitialized] = useState(false);

  // Initialize - fetch profile once
  useEffect(() => {
    if (!user && !profileLoading && !initialized) {
      dispatch(fetchUserProfile());
      setInitialized(true);
    }
  }, [dispatch, user, profileLoading, initialized]);

  // Once user is loaded, fetch security questions
  useEffect(() => {
    if (user?.id && securityQuestions.length === 0 && !securityQuestionsLoading) {
      dispatch(fetchSecurityQuestions());
      dispatch(fetchUserSecurityQuestions());
    }
  }, [dispatch, user?.id, securityQuestions.length, securityQuestionsLoading]);

  // Handle existing user questions
  useEffect(() => {
    if (userSecurityQuestions && userSecurityQuestions.length > 0) {
      setExistingQuestions(userSecurityQuestions);
      const initialShowAnswers = {};
      userSecurityQuestions.forEach((_, index) => {
        initialShowAnswers[index] = false;
      });
      setShowAnswers(initialShowAnswers);
    }
  }, [userSecurityQuestions]);

  const toggleAnswerVisibility = (index) => {
    setShowAnswers((prev) => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  // Get available questions for dropdown (exclude already selected ones)
  const getAvailableQuestions = (currentIndex) => {
    const selectedQuestionIds = questions
      .map((q, index) => index === currentIndex ? '' : q.question_id)
      .filter(id => id !== '');
    
    return securityQuestions.filter(q => !selectedQuestionIds.includes(q.id));
  };

  const handleQuestionChange = (index, field, value) => {
    const updatedQuestions = [...questions];
    if (field === 'question') {
      const selectedQuestion = securityQuestions.find(q => q.question === value);
      updatedQuestions[index] = {
        ...updatedQuestions[index],
        question_id: selectedQuestion?.id || '',
        question: value
      };
    } else {
      updatedQuestions[index][field] = value;
    }
    setQuestions(updatedQuestions);
  };

  const addQuestion = () => {
    if (questions.length < 5) {
      setQuestions([...questions, { question_id: '', question: '', answer: '' }]);
    }
  };

  const removeQuestion = (index) => {
    if (questions.length > 1) {
      const updatedQuestions = questions.filter((_, i) => i !== index);
      setQuestions(updatedQuestions);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();

    // Count existing questions when editing
    const existingCount = isEditing ? existingQuestions.length : 0;
    const validQuestions = questions.filter(
      (q) => q.question_id.trim() && q.answer.trim()
    );
    
    // Check if total questions (existing + new) meet minimum requirement
    const totalQuestions = isEditing ? existingCount + validQuestions.length : validQuestions.length;
    
    if (totalQuestions < 2) {
      toast.error('Please set up at least 2 security questions for better account security');
      return;
    }

    // Check for duplicate questions
    const questionIds = validQuestions.map((q) => q.question_id.trim());
    const uniqueQuestions = new Set(questionIds);
    if (uniqueQuestions.size !== validQuestions.length) {
      toast.error('Please select unique questions for each entry');
      return;
    }

    try {
      // Only save valid questions
      await dispatch(saveSecurityQuestions(validQuestions)).unwrap();
      await dispatch(fetchUserSecurityQuestions()).unwrap();
      setIsEditing(false);
      setQuestions([
        { question_id: '', question: '', answer: '' },
        { question_id: '', question: '', answer: '' },
        { question_id: '', question: '', answer: '' }
      ]);
      toast.success('Security questions updated successfully!');
    } catch (error) {
      toast.error(error || 'Failed to save security questions');
    }
  };

  const handleEdit = () => {
    if (existingQuestions.length > 0) {
      const formattedQuestions = existingQuestions.map(eq => ({
        question_id: eq.question_id,
        question: eq.question,
        answer: ''
      }));
      setQuestions(formattedQuestions);
    }
    setIsEditing(true);
  };

  const handleCancel = () => {
    setQuestions([
      { question_id: '', question: '', answer: '' },
      { question_id: '', question: '', answer: '' },
      { question_id: '', question: '', answer: '' }
    ]);
    setIsEditing(false);
  };

  const handleAddNew = () => {
    setQuestions([
      { question_id: '', question: '', answer: '' },
      { question_id: '', question: '', answer: '' },
      { question_id: '', question: '', answer: '' }
    ]);
    setIsEditing(true);
  };

  const handleManualFetch = () => {
    dispatch(fetchSecurityQuestions());
  };

  // Show loading while profile is being fetched
  if (profileLoading || (!user && initialized)) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Show error if profile failed to load
  if (error && !user) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          <p>Failed to load profile: {error}</p>
          <button 
            onClick={() => dispatch(fetchUserProfile())}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Security Questions</h2>
        {!isEditing && (
          <div className="flex gap-2">
            {existingQuestions.length > 0 ? (
              <>
                <button
                  onClick={handleEdit}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Edit Questions
                </button>
                {existingQuestions.length < 5 && (
                  <button
                    onClick={handleAddNew}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Add More
                  </button>
                )}
              </>
            ) : (
              <button
                onClick={handleAddNew}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Add Security Questions
              </button>
            )}
          </div>
        )}
      </div>

      {!isEditing && existingQuestions.length > 0 ? (
        <div className="space-y-4">
          {existingQuestions.length < 2 && (
            <div className="p-3 bg-amber-100 border border-amber-400 text-amber-700 rounded">
              <p className="font-medium">⚠️ Security Alert</p>
              <p className="text-sm mt-1">
                You only have {existingQuestions.length} security question{existingQuestions.length === 1 ? '' : 's'} set up. 
                For better account security, we recommend having at least 2 security questions.
              </p>
            </div>
          )}
          <p className="text-gray-600 mb-4">
            Your security questions are set up. You can edit them or add more if needed.
          </p>
          {existingQuestions.map((q, index) => (
            <div key={index} className="p-4 border border-gray-200 rounded-lg">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800">Question {index + 1}</h3>
                  <p className="text-gray-600 mt-1">{q.question}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-gray-700 text-sm">Answer:</span>
                    {showAnswers[index] ? (
                      <span className="font-medium text-sm">{q.answer}</span>
                    ) : (
                      <span className="font-mono text-sm">••••••••</span>
                    )}
                    <button
                      type="button"
                      onClick={() => toggleAnswerVisibility(index)}
                      className="text-blue-600 hover:text-blue-800 text-sm underline"
                    >
                      {showAnswers[index] ? 'Hide' : 'Show'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <form onSubmit={handleSave} className="space-y-6">
          <div className="space-y-4">
            {questions.map((question, index) => (
              <div key={index} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex justify-between items-center mb-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Question {index + 1}
                  </label>
                  {questions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeQuestion(index)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Remove
                    </button>
                  )}
                </div>

                {securityQuestionsLoading ? (
                  <div className="animate-pulse">
                    <div className="h-10 bg-gray-200 rounded w-full mb-3"></div>
                  </div>
                ) : securityQuestions.length === 0 ? (
                  <div className="space-y-2">
                    <select
                      disabled
                      className="w-full p-2 border border-gray-300 rounded-md bg-gray-100"
                    >
                      <option>No questions available</option>
                    </select>
                    <button
                      type="button"
                      onClick={handleManualFetch}
                      className="text-sm text-blue-600 hover:text-blue-800 underline"
                    >
                      Try loading questions again
                    </button>
                  </div>
                ) : (
                  <select
                    value={question.question}
                    onChange={(e) =>
                      handleQuestionChange(index, 'question', e.target.value)
                    }
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select a security question</option>
                    {getAvailableQuestions(index).map((questionOption) => (
                      <option key={questionOption.id} value={questionOption.question}>
                        {questionOption.question}
                      </option>
                    ))}
                  </select>
                )}

                <input
                  type="text"
                  placeholder="Your answer"
                  value={question.answer}
                  onChange={(e) =>
                    handleQuestionChange(index, 'answer', e.target.value)
                  }
                  className="w-full mt-3 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            ))}
          </div>

          {questions.length < 5 && (
            <button
              type="button"
              onClick={addQuestion}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              + Add Another Question
            </button>
          )}

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={savingSecurityQuestions}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {savingSecurityQuestions ? 'Saving...' : 'Save Questions'}
            </button>

            {isEditing && (
              <button
                type="button"
                onClick={handleCancel}
                className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            )}
          </div>
          
          {/* Validation helper */}
          <div className="mt-2 text-sm text-gray-600">
            <p>
              📋 Complete at least 2 questions to save. 
              Current: {questions.filter(q => q.question_id && q.answer.trim()).length} of {questions.length}
              {isEditing && existingQuestions.length > 0 && ` (You already have ${existingQuestions.length} question${existingQuestions.length === 1 ? '' : 's'})`}
            </p>
          </div>
        </form>
      )}

      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h3 className="font-semibold text-yellow-800 mb-2">Important Notes</h3>
        <ul className="text-yellow-700 text-sm space-y-1">
          <li>• Security answers are case-sensitive</li>
          <li>• Choose questions that are memorable but not easily guessable</li>
          <li>• You need at least 2 questions for account security (minimum requirement)</li>
          <li>• We recommend having 3-5 questions for maximum security</li>
          <li>• These questions will be used for password recovery</li>
        </ul>
      </div>
    </div>
  );
};

export default MySecurityQuestions;