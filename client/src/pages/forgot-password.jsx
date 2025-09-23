import React, { useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { resetPasswordWithSecurity } from '../redux/features/auth/authSlice';
import Header from '../components/Header';
import Footer from '../components/Footer';

const ForgotPassword = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { status, error, isAuthenticated, user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/profile');
      }
    }
  }, [isAuthenticated, user, navigate]);

  const formik = useFormik({
    initialValues: {
      username: '',
      question: '',
      answer: '',
      newPassword: '',
    },
    validationSchema: Yup.object({
      username: Yup.string().required('Username required'),
      question: Yup.string().required('Security question required'),
      answer: Yup.string().required('Answer required'),
      newPassword: Yup.string().min(6).required('New password required'),
    }),
    onSubmit: (values) => {
      dispatch(resetPasswordWithSecurity(values));
    },
  });

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow flex items-center justify-center bg-gray-50">
        <div className="w-full max-w-md p-8 bg-white shadow-lg rounded-lg">
          <h2 className="text-2xl font-bold text-center">Reset Password</h2>
          <form onSubmit={formik.handleSubmit} className="space-y-4">
            {['username', 'question', 'answer', 'newPassword'].map((field, i) => (
              <div key={i}>
                <label className="block text-sm font-medium text-gray-700 capitalize">{field}</label>
                <input
                  name={field}
                  type={field === 'newPassword' ? 'password' : 'text'}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values[field]}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                />
                {formik.touched[field] && formik.errors[field] && (
                  <div className="text-red-500 text-sm">{formik.errors[field]}</div>
                )}
              </div>
            ))}
            {error && <div className="text-red-500 text-center">{error}</div>}
            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full py-2 px-4 rounded-md bg-[#C9A35D] text-black"
            >
              {status === 'loading' ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ForgotPassword;
