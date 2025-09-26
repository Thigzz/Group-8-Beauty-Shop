import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { saveSecurityQuestions, fetchUserProfile, fetchSecurityQuestions, fetchUserSecurityQuestions } from '../redux/features/auth/authSlice';
import toast from 'react-hot-toast';

const MySecurityQuestions = () => {
  const dispatch = useDispatch();
  const { user, securityQuestions, userSecurityQuestions, status, error } = useSelector((state) => state.auth);

  const [questions, setQuestions] = useState([
    { question_id: '', question: '', answer: '' },
    { question_id: '', question: '', answer: '' },
    { question_id: '', question: '', answer: '' }
  ]);

  const [isEditing, setIsEditing] = useState(false);
  const [existingQuestions, setExistingQuestions] = useState([]);
  const [showAnswers, setShowAnswers] = useState({});
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  // Use refs to track if we've already fetched data
  const profileFetched = useRef(false);
  const questionsFetched = useRef(false);

  // Fetch user profile on mount - only once
  useEffect(() => {
    console.log('Profile useEffect running', { profileFetched: profileFetched.current, user: !!user });
    if (!profileFetched.current && !user) {
      console.log('Fetching user profile...');
      profileFetched.current = true;
      dispatch(fetchUserProfile()).finally(() => {
        setHasLoaded(true);
      });
    } else if (user) {
      console.log('User already exists, setting hasLoaded to true');
      setHasLoaded(true);
    }
  }, [dispatch]); // Only depend on dispatch

  // Handle user data changes - now using userSecurityQuestions
  useEffect(() => {
    console.log('User data useEffect running', { user: !!user, userSecurityQuestions });
    if (userSecurityQuestions && userSecurityQuestions.length > 0) {
      setExistingQuestions(userSecurityQuestions);

      // Initialize showAnswers state to false for all questions
      const initialShowAnswers = {};
      userSecurityQuestions.forEach((_, index) => {
        initialShowAnswers[index] = false;
      });
      setShowAnswers(initialShowAnswers);
    }
  }, [userSecurityQuestions]); // Depend on userSecurityQuestions instead

  // Fetch security questions and user questions when user is available
  useEffect(() => {
    console.log('Security questions useEffect running', { 
      userId: user?.id, 
      questionsFetched: questionsFetched.current, 
      isLoadingQuestions,
      securityQuestionsLength: securityQuestions.length 
    });
    
    const fetchQuestions = async () => {
      // Only fetch if we have a user, haven't fetched yet, and not currently loading
      if (user?.id && !questionsFetched.current && !isLoadingQuestions) {
        console.log('Fetching security questions for user:', user.id);
        questionsFetched.current = true;
        setIsLoadingQuestions(true);
        try {
          // Fetch available questions
          const result = await dispatch(fetchSecurityQuestions()).unwrap();
          console.log('Available security questions fetched:', result);
          
          // Also fetch user's existing security questions
          try {
            await dispatch(fetchUserSecurityQuestions()).unwrap();
            console.log('User security questions fetched');
          } catch (userQuestionsError) {
            console.log('No existing user security questions found:', userQuestionsError);
          }
          
        } catch (error) {
          console.error('Failed to fetch security questions:', error);
          toast.error('Failed to load security questions');
          questionsFetched.current = false; // Reset on error
        } finally {
          setIsLoadingQuestions(false);
        }
      }
    };

    if (user?.id) {
      console.log('User ID exists, calling fetchQuestions');
      fetchQuestions();
    } else {
      console.log('No user ID available yet');
    }
  }, [user?.id, dispatch]);

  const toggleAnswerVisibility = (index) => {
    setShowAnswers((prev) => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const handleQuestionChange = (index, field, value) => {
    const updatedQuestions = [...questions];
    if (field === 'question') {
      // Find the selected question object
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

    console.log('Save button clicked');
    console.log('Current user:', user);
    console.log('Current token exists:', !!localStorage.getItem('token'));
    console.log('Questions to save:', questions);

    // Validate questions
    const invalidQuestions = questions.filter(
      (q) => !q.question_id.trim() || !q.answer.trim()
    );
    if (invalidQuestions.length > 0) {
      toast.error('Please fill in all questions and answers');
      return;
    }

    // Check for duplicate questions
    const questionIds = questions.map((q) => q.question_id.trim());
    const uniqueQuestions = new Set(questionIds);
    if (uniqueQuestions.size !== questions.length) {
      toast.error('Please select unique questions for each entry');
      return;
    }

    try {
      console.log('Dispatching saveSecurityQuestions...');
      await dispatch(saveSecurityQuestions(questions)).unwrap();
      console.log('Save successful, fetching user questions...');
      // Refresh user's security questions after saving
      await dispatch(fetchUserSecurityQuestions()).unwrap();
      setIsEditing(false);
      setQuestions([
        { question_id: '', question: '', answer: '' },
        { question_id: '', question: '', answer: '' },
        { question_id: '', question: '', answer: '' }
      ]);
      toast.success('Security questions updated successfully!');
    } catch (error) {
      console.error('Save failed:', error);
      toast.error(error || 'Failed to save security questions');
    }
  };

  const handleEdit = () => {
    if (existingQuestions.length > 0) {
      // Convert existing questions to the format expected by the form
      const formattedQuestions = existingQuestions.map(eq => ({
        question_id: eq.question_id,
        question: eq.question,
        answer: '' // Don't pre-fill answers for security
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

  const handleManualFetchQuestions = async () => {
    console.log('Manual fetch triggered');
    questionsFetched.current = false; // Reset the ref
    setIsLoadingQuestions(true);
    try {
      const result = await dispatch(fetchSecurityQuestions()).unwrap();
      console.log('Manual fetch result:', result);
      toast.success('Security questions loaded successfully');
    } catch (error) {
      console.error('Manual fetch error:', error);
      toast.error('Failed to load security questions');
    } finally {
      setIsLoadingQuestions(false);
    }
  };

  const handleRetry = () => {
    profileFetched.current = false;
    setHasLoaded(false);
    dispatch(fetchUserProfile()).finally(() => {
      setHasLoaded(true);
    });
  };

  // Show loading only when initially loading and no user data yet
  if (status === 'loading' && !hasLoaded && !user) {
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

  // If there's an error and no user data, show error
  if (status === 'failed' && !user && hasLoaded) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          <p>Failed to load profile: {error}</p>
          <button 
            onClick={handleRetry}
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
              <button
                onClick={handleEdit}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Edit Questions
              </button>
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

      {error && status !== 'loading' && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {!isEditing && existingQuestions.length > 0 ? (
        <div className="space-y-4">
          <p className="text-gray-600 mb-4">
            Your security questions are set up. You can edit them if needed.
          </p>
          {existingQuestions.map((q, index) => (
            <div key={index} className="p-4 border border-gray-200 rounded-lg">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800">Question {index + 1}</h3>
                  <p className="text-gray-600 mt-1">{q.question}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-gray-700 text-sm">Answer:</span>
                    <span className="font-mono text-sm">
                      {showAnswers[index] ? '(Hidden for security)' : '••••••••'}
                    </span>
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

                {isLoadingQuestions ? (
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
                      onClick={handleManualFetchQuestions}
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
                    {securityQuestions.map((questionOption) => (
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
              disabled={status === 'loading' || isLoadingQuestions}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {status === 'loading' ? 'Saving...' : 'Save Questions'}
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
        </form>
      )}

      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h3 className="font-semibold text-yellow-800 mb-2">Important Notes</h3>
        <ul className="text-yellow-700 text-sm space-y-1">
          <li>• Security answers are case-sensitive</li>
          <li>• Choose questions that are memorable but not easily guessable</li>
          <li>• You need at least 3 questions for security purposes</li>
          <li>• These questions will be used for password recovery</li>
        </ul>
      </div>

      {/* Debug info - remove this in production */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-4 p-4 bg-gray-100 border rounded-lg">
          <h4 className="font-semibold mb-2">Debug Info:</h4>
          <p>User ID: {user?.id || 'Not available'}</p>
          <p>User Object: {user ? 'Available' : 'Not available'}</p>
          <p>Token in localStorage: {localStorage.getItem('token') ? 'Available' : 'Not available'}</p>
          <p>Is Authenticated: {user ? 'true' : 'false'}</p>
          <p>Available Questions Count: {securityQuestions?.length || 0}</p>
          <p>User Questions Count: {userSecurityQuestions?.length || 0}</p>
          <p>Is Loading Questions: {isLoadingQuestions.toString()}</p>
          <p>Questions Fetched: {questionsFetched.current.toString()}</p>
          <p>Status: {status}</p>
          <p>Current Form Questions:</p>
          <pre className="text-xs mt-1 p-2 bg-gray-50 rounded overflow-auto">
            {JSON.stringify(questions, null, 2)}
          </pre>
          <details className="mt-2">
            <summary className="cursor-pointer font-medium">Available Questions</summary>
            <pre className="text-xs mt-1 p-2 bg-gray-50 rounded overflow-auto">
              {JSON.stringify(securityQuestions, null, 2)}
            </pre>
          </details>
          <details className="mt-2">
            <summary className="cursor-pointer font-medium">User Questions</summary>
            <pre className="text-xs mt-1 p-2 bg-gray-50 rounded overflow-auto">
              {JSON.stringify(userSecurityQuestions, null, 2)}
            </pre>
          </details>
        </div>
      )}
    </div>
  );
};

export default MySecurityQuestions;