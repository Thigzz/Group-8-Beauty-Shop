import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { updateUserProfile } from '../../redux/features/auth/authSlice';
import { UserCircle2 } from 'lucide-react';
import Modal from '../../components/Modal';
import ChangePasswordModal from '../../components/admin/ChangePasswordModal';

const SettingsPage = () => {
  const dispatch = useDispatch();
  const { user, status } = useSelector((state) => state.auth);
  
  const [isChangePasswordOpen, setChangePasswordOpen] = useState(false);

  const formik = useFormik({
    initialValues: {
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
      email: user?.email || '',
    },
    enableReinitialize: true,
    validationSchema: Yup.object({
      first_name: Yup.string().required('First name is required'),
      last_name: Yup.string().required('Last name is required'),
      email: Yup.string().email('Invalid email address').required('Email is required'),
    }),
    onSubmit: (values) => {
      const { first_name, last_name, email } = values;
      dispatch(updateUserProfile({ first_name, last_name, email }));
    },
  });

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Edit Profile</h1>

      <div className="bg-white p-8 rounded-lg shadow-md max-w-2xl mx-auto">
        <h2 className="text-xl font-semibold text-gray-700 mb-6">Update Profile Information</h2>
        
        <form onSubmit={formik.handleSubmit} className="space-y-6">
          <div className="flex items-center space-x-4">
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center">
                <UserCircle2 size={48} className="text-gray-400" />
            </div>
            {/* The "Change" button that was here has been removed */}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="first_name" className="block text-sm font-medium text-gray-700">First Name</label>
              <input id="first_name" type="text" {...formik.getFieldProps('first_name')} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"/>
              {formik.touched.first_name && formik.errors.first_name ? <div className="text-red-500 text-sm mt-1">{formik.errors.first_name}</div> : null}
            </div>
            <div>
              <label htmlFor="last_name" className="block text-sm font-medium text-gray-700">Last Name</label>
              <input id="last_name" type="text" {...formik.getFieldProps('last_name')} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"/>
              {formik.touched.last_name && formik.errors.last_name ? <div className="text-red-500 text-sm mt-1">{formik.errors.last_name}</div> : null}
            </div>
          </div>
          
          <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
              <input id="email" type="email" {...formik.getFieldProps('email')} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"/>
              {formik.touched.email && formik.errors.email ? <div className="text-red-500 text-sm mt-1">{formik.errors.email}</div> : null}
          </div>

          <div className="flex justify-between items-center pt-4 border-t mt-6">
            <span className="text-sm text-gray-600">Update your password.</span>
            <button
                type="button"
                onClick={() => setChangePasswordOpen(true)}
                className="bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded-md hover:bg-gray-300"
            >
                Change Password
            </button>
          </div>

          <div className="text-right">
            <button type="submit" disabled={status === 'loading'} className="bg-[#C9A35D] text-black font-bold py-2 px-6 rounded-md hover:opacity-90 disabled:opacity-50">
              {status === 'loading' ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>

      <Modal isOpen={isChangePasswordOpen} onClose={() => setChangePasswordOpen(false)} title="Change Password">
        <ChangePasswordModal onClose={() => setChangePasswordOpen(false)} />
      </Modal>
    </div>
  );
};

export default SettingsPage;