import React, { useEffect, useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getResetQuestions, verifyAnswers, resetPasswordWithToken } from '../redux/features/auth/authSlice';
import Footer from '../components/Footer';
import { FaEye, FaEyeSlash } from 'react-icons/fa'; // Import icons

const ForgotPassword = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { status, error, isAuthenticated, user, resetQuestions } = useSelector((state) => state.auth);
  const [answersVerified, setAnswersVerified] = useState(false);
  const [resetToken, setResetToken] = useState(null);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/profile');
      }
    }
  }, [isAuthenticated, user, navigate]);

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  const formik = useFormik({
    initialValues: {
      username: '',
      answers: resetQuestions.map(() => ''),
      newPassword: '',
    },
    enableReinitialize: true,
    validationSchema: Yup.object({
      username: Yup.string().required('Username required'),
      answers: Yup.array().of(Yup.string().required('Answer is required')),
      newPassword: Yup.string().when('answersVerified', {
        is: (val) => val === true,
        then: () => Yup.string().min(6, 'Password must be at least 6 characters').required('New password is required'),
        otherwise: () => Yup.string(),
      }),
    }),
    onSubmit: async (values) => {
      if (!answersVerified) {
        const answersPayload = resetQuestions.map((q, i) => ({
          question_id: q.id,
          answer: values.answers[i],
        }));
        try {
          const result = await dispatch(verifyAnswers({ login_identifier: values.username, answers: answersPayload })).unwrap();
          setResetToken(result.reset_token);
          setAnswersVerified(true);
        } catch (err) {
          // Error is handled by the rejected case in the extraReducers
        }
      } else {
        dispatch(resetPasswordWithToken({ token: resetToken, new_password: values.newPassword }));
      }
    },
  });

  const handleUsernameBlur = () => {
    if (formik.values.username) {
      dispatch(getResetQuestions({ login_identifier: formik.values.username }));
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow flex items-center justify-center bg-gray-50">
        <div className="w-full max-w-md p-8 bg-white shadow-lg rounded-lg">
          <h2 className="text-2xl font-bold text-center">Reset Password</h2>
          <form onSubmit={formik.handleSubmit} className="space-y-4">
            {!answersVerified ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Username or Email</label>
                  <input
                    name="username"
                    type="text"
                    onChange={formik.handleChange}
                    onBlur={handleUsernameBlur}
                    value={formik.values.username}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                  {formik.touched.username && formik.errors.username && (
                    <div className="text-red-500 text-sm">{formik.errors.username}</div>
                  )}
                </div>
                {resetQuestions.map((q, i) => (
                  <div key={q.id}>
                    <label className="block text-sm font-medium text-gray-700">{q.question}</label>
                    <input
                      name={`answers[${i}]`}
                      type="text"
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      value={formik.values.answers[i] || ''}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                    {formik.touched.answers && formik.errors.answers && formik.errors.answers[i] && (
                      <div className="text-red-500 text-sm">{formik.errors.answers[i]}</div>
                    )}
                  </div>
                ))}
                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="w-full py-2 px-4 rounded-md bg-[#C9A35D] text-black"
                >
                  {status === 'loading' ? 'Verifying...' : 'Verify Answers'}
                </button>
              </>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700">New Password</label>
                <div className="relative">
                  <input
                    name="newPassword"
                    type={isPasswordVisible ? 'text' : 'password'}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.newPassword}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-600"
                  >
                    {isPasswordVisible ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {formik.touched.newPassword && formik.errors.newPassword && (
                  <div className="text-red-500 text-sm">{formik.errors.newPassword}</div>
                )}
                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="w-full mt-4 py-2 px-4 rounded-md bg-[#C9A35D] text-black"
                >
                  {status === 'loading' ? 'Resetting...' : 'Reset Password'}
                </button>
              </div>
            )}
            {error && <div className="text-red-500 text-center">{error}</div>}
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ForgotPassword;