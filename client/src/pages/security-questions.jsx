import React from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useDispatch, useSelector } from 'react-redux';
import { saveSecurityQuestions } from '../redux/features/auth/authSlice';
import Header from '../components/Header';
import Footer from '../components/Footer';

const SecurityQuestions = () => {
  const dispatch = useDispatch();
  const { status, error } = useSelector((state) => state.auth);

  const formik = useFormik({
    initialValues: {
      question1: '',
      answer1: '',
      question2: '',
      answer2: '',
    },
    validationSchema: Yup.object({
      question1: Yup.string().required('Required'),
      answer1: Yup.string().required('Required'),
      question2: Yup.string().required('Required'),
      answer2: Yup.string().required('Required'),
    }),
    onSubmit: (values) => {
      dispatch(saveSecurityQuestions(values));
    },
  });

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow flex items-center justify-center bg-gray-50">
        <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-center text-gray-900">Set Security Questions</h2>
          <form onSubmit={formik.handleSubmit} className="space-y-4">
            {['question1', 'answer1', 'question2', 'answer2'].map((field, i) => (
              <div key={i}>
                <label className="block text-sm font-medium text-gray-700 capitalize">{field}</label>
                <input
                  name={field}
                  type="text"
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
              {status === 'loading' ? 'Saving...' : 'Save Questions'}
            </button>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SecurityQuestions;
