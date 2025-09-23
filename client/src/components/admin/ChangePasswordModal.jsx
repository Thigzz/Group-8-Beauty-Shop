import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useFormik } from 'formik';
import * as Yup from 'yup';
//import { changePassword } from '../../redux/features/auth/authSlice';
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
            new_password: Yup.string().min(8, 'Password must be at least 8 characters').required('New password is required'),
            confirm_password: Yup.string()
                .oneOf([Yup.ref('new_password'), null], 'Passwords must match')
                .required('Please confirm your new password'),
        }),
        onSubmit: (values) => {
            dispatch(changePassword(values)).then((result) => {
                if (result.meta.requestStatus === 'fulfilled') {
                    onClose();
                }
            });
        },
    });

    return (
        <form onSubmit={formik.handleSubmit} className="space-y-4">
            {/* Current Password */}
            <div>
                <label htmlFor="current_password"
                       className="block text-sm font-medium">
                    Current Password
                </label>
                <div className="relative">
                    <input
                        id="current_password"
                        name="current_password"
                        type={showCurrent ? 'text' : 'password'}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.current_password}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                    <button type="button" onClick={() => setShowCurrent(!showCurrent)}
                            className="absolute inset-y-0 right-0 px-3 flex items-center">
                        {showCurrent ? <EyeOff size={18}/> : <Eye size={18}/>}
                    </button>
                </div>
                {formik.touched.current_password && formik.errors.current_password && (
                    <p className="text-red-500 text-xs mt-1">{formik.errors.current_password}</p>
                )}
            </div>

            {/* New Password */}
            <div>
                <label htmlFor="new_password"
                       className="block text-sm font-medium">
                    New Password
                </label>
                <div className="relative">
                    <input
                        id="new_password"
                        name="new_password"
                        type={showNew ? 'text' : 'password'}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.new_password}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                    <button type="button" onClick={() => setShowNew(!showNew)}
                            className="absolute inset-y-0 right-0 px-3 flex items-center">
                        {showNew ? <EyeOff size={18}/> : <Eye size={18}/>}
                    </button>
                </div>
                {formik.touched.new_password && formik.errors.new_password && (
                    <p className="text-red-500 text-xs mt-1">{formik.errors.new_password}</p>
                )}
            </div>

            {/* Confirm New Password */}
            <div>
                <label htmlFor="confirm_password"
                       className="block text-sm font-medium">
                    Confirm New Password
                </label>
                <div className="relative">
                    <input
                        id="confirm_password"
                        name="confirm_password"
                        type={showConfirm ? 'text' : 'password'}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.confirm_password}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                    <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                            className="absolute inset-y-0 right-0 px-3 flex items-center">
                        {showConfirm ? <EyeOff size={18}/> : <Eye size={18}/>}
                    </button>
                </div>
                {formik.touched.confirm_password && formik.errors.confirm_password && (
                    <p className="text-red-500 text-xs mt-1">{formik.errors.confirm_password}</p>
                )}
            </div>

            {/* General Error */}
            {status === 'failed' && error && (
                <p className="text-red-500 text-sm">{typeof error === 'string' ? error : error.message}</p>
            )}

            <div className="text-right pt-4">
                <button
                    type="submit"
                    disabled={status === 'loading'}
                    className="bg-[#C9A35D] text-black font-bold py-2 px-6 rounded-md hover:opacity-90 disabled:opacity-50"
                >
                    {status === 'loading' ? 'Updating...' : 'Update Password'}
                </button>
            </div>
        </form>
    );
};

export default ChangePasswordModal;