import React, { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useDispatch, useSelector } from 'react-redux';
import { changePassword } from '../../redux/features/auth/authSlice';
import { Eye, EyeOff } from 'lucide-react';

const ChangePasswordModal = ({ onClose }) => {
  const dispatch = useDispatch();
  const { status, error } = useSelector((state) => state.auth);

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const formik = useFormik({
    initialValues: {
      current_password: '',
      new_password: '',
      confirm_password: '',
    },
    validationSchema: Yup.object({
      current_password: Yup.string().required('Current password is required'),
      new_password: Yup.string()
        .required('New password is required')
        .min(8, 'Password must be at least 8 characters'),
      confirm_password: Yup.string()
        .oneOf([Yup.ref('new_password'), null], 'Passwords must match')
        .required('Please confirm your new password'),
    }),
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      const result = await dispatch(changePassword(values));
      if (changePassword.fulfilled.match(result)) {
        resetForm();
        onClose();
      }
      setSubmitting(false);
    },
  });

  return (
    <form onSubmit={formik.handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium">Current Password</label>
        <div className="relative">
          <input
            name="current_password"
            type={showCurrent ? 'text' : 'password'}
            {...formik.getFieldProps('current_password')}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
          />
          <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute inset-y-0 right-0 px-3 flex items-center">
            {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {formik.touched.current_password && formik.errors.current_password && <div className="text-red-500 text-sm mt-1">{formik.errors.current_password}</div>}
      </div>

      <div>
        <label className="block text-sm font-medium">New Password</label>
        <div className="relative">
          <input
            name="new_password"
            type={showNew ? 'text' : 'password'}
            {...formik.getFieldProps('new_password')}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
          />
          <button type="button" onClick={() => setShowNew(!showNew)} className="absolute inset-y-0 right-0 px-3 flex items-center">
            {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {formik.touched.new_password && formik.errors.new_password && <div className="text-red-500 text-sm mt-1">{formik.errors.new_password}</div>}
      </div>

      <div>
        <label className="block text-sm font-medium">Confirm New Password</label>
        <div className="relative">
          <input
            name="confirm_password"
            type={showConfirm ? 'text' : 'password'}
            {...formik.getFieldProps('confirm_password')}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
          />
          <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute inset-y-0 right-0 px-3 flex items-center">
            {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {formik.touched.confirm_password && formik.errors.confirm_password && <div className="text-red-500 text-sm mt-1">{formik.errors.confirm_password}</div>}
      </div>

      {error && <div className="text-red-500 text-center text-sm">{error}</div>}

      <div className="text-right pt-4">
        <button type="submit" disabled={formik.isSubmitting} className="bg-[#C9A35D] text-black font-bold py-2 px-6 rounded-md hover:opacity-90 disabled:opacity-50">
          {formik.isSubmitting ? 'Updating...' : 'Update Password'}
        </button>
      </div>
    </form>
  );
};

export default ChangePasswordModal;