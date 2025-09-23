import React, { useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser } from '../redux/features/auth/authSlice';
import Header from '../components/Header';
import Footer from '../components/Footer';

const LoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, status, error, user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated && user) {
      // 1. Should check if the logged-in user is an admin and redirects to admin dash
      if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        // 2. Otherwise, redirect to the regular user profile
        navigate('/profile');
      }
    }
  }, [isAuthenticated, user, navigate]);

  const formik = useFormik({
    initialValues: {
      login_identifier: '',
      password: '',
    },
    validationSchema: Yup.object({
      login_identifier: Yup.string().required('Email or Username is required'),
      password: Yup.string().required('Password is required'),
    }),
    onSubmit: (values) => {
      dispatch(loginUser(values));
    },
  });

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow flex items-center justify-center bg-gray-50">
        <div className="w-full max-w-md p-8 space-y-8 bg-white shadow-lg rounded-lg">
          <h2 className="text-3xl font-bold text-center text-gray-900">
            Log In to Your Account
          </h2>
          <form onSubmit={formik.handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="login_identifier" className="block text-sm font-medium text-gray-700">
                Email or Username
              </label>
              <input
                id="login_identifier"
                name="login_identifier"
                type="text"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.login_identifier}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#C9A35D] focus:border-[#C9A35D]"
              />
              {formik.touched.login_identifier && formik.errors.login_identifier ? (
                <div className="text-red-500 text-sm mt-1">{formik.errors.login_identifier}</div>
              ) : null}
            </div>

            <div>
              <label htmlFor="password"  className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.password}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#C9A35D] focus:border-[#C9A35D]"
              />
              {formik.touched.password && formik.errors.password ? (
                <div className="text-red-500 text-sm mt-1">{formik.errors.password}</div>
              ) : null}
            </div>

            {error && <div className="text-red-500 text-center">{error}</div>}

            <div>
              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-black bg-[#C9A35D] hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#C9A35D] disabled:opacity-50"
              >
                {status === 'loading' ? 'Signing In...' : 'Sign In'}
              </button>
            </div>
          </form>
          <div className="text-sm text-center">
            <Link to="/forgot-password" className="font-medium text-gray-600 hover:text-[#C9A35D]">
                Forgot your password?
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default LoginPage;