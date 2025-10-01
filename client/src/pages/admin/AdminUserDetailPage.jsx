import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import toast from 'react-hot-toast';
import { Loader, User, Mail, Phone, Lock, Save, Ban, CheckCircle, ArrowLeft } from 'lucide-react';
import apiClient from '../../api/axios';

const AdminUserDetailPage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { token } = useSelector((state) => state.auth);

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // --- Fetch User Data ---
  const fetchUser = async () => {
    if (!token) return;
    setLoading(true);
    try {
      // Endpoint to get a single user detail
      const res = await apiClient.get(`/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(res.data);
      formik.setValues(res.data);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch user details", err);
      setError("Failed to load user details. Check if the user ID is valid.");
      toast.error("Failed to load user details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, [token, userId]);

  // --- Formik Setup ---
  const formik = useFormik({
    initialValues: {
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
      username: user?.username || '',
      email: user?.email || '',
      primary_phone_no: user?.primary_phone_no || '',
      secondary_phone_no: user?.secondary_phone_no || '',
    },
    validationSchema: Yup.object({
      first_name: Yup.string().required('First name is required'),
      last_name: Yup.string().required('Last name is required'),
      username: Yup.string().required('Username is required'),
      email: Yup.string().email('Invalid email address').required('Email is required'),
      primary_phone_no: Yup.string().matches(/^\d{10}$/, 'Invalid phone number').required('Primary phone is required'),
      secondary_phone_no: Yup.string().matches(/^\d{10}$/, 'Invalid phone number').optional().nullable(),
    }),
    onSubmit: async (values) => {
      setIsSubmitting(true);
      try {
        // Endpoint to update user details
        await apiClient.put(`/admin/users/${userId}`, values, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("User details updated successfully!");
        fetchUser();
      } catch (err) {
        toast.error(err.response?.data?.error || "Failed to update user details.");
        console.error("Update failed", err);
      } finally {
        setIsSubmitting(false);
      }
    },
    enableReinitialize: true,
  });

  // --- Activate/Deactivate Logic ---
  const handleToggleActiveStatus = async () => {
    const newStatus = !user.is_active;
    const actionText = newStatus ? 'activate' : 'deactivate';
    setIsSubmitting(true);

    try {
      // Endpoint to toggle user status
      const endpoint = newStatus
        ? `/admin/users/${userId}/activate`
        : `/admin/users/${userId}/deactivate`;

      await apiClient.patch(endpoint, {}, { headers: { Authorization: `Bearer ${token}` } });

      setUser(prev => ({ ...prev, is_active: newStatus }));
      toast.success(`User successfully ${newStatus ? 'activated' : 'deactivated'}.`);

    } catch (err) {
      toast.error(`Failed to ${actionText} user.`);
      console.error(`Toggle status failed for ${actionText}`, err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadgeStyle = (isActive) => {
    const baseClasses = "px-3 py-1 rounded-full text-xs font-medium inline-flex items-center";
    return isActive
      ? `${baseClasses} bg-green-100 text-green-800 border border-green-200`
      : `${baseClasses} bg-red-100 text-red-800 border border-red-200`;
  };

  if (loading) return <div className="p-6 flex justify-center items-center h-full"><Loader className="animate-spin" /> Loading...</div>;
  if (error) return <div className="p-6 text-red-600 font-semibold">{error}</div>;
  if (!user) return <div className="p-6">User not found.</div>;

  return (
    <div className="p-6 bg-gray-50 min-h-full">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/admin/users')}
            className="flex items-center text-[#C9A35D] hover:text-[#b18e4e] mb-4 transition-colors"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back to Users
          </button>

          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-800">
              User Details: {user.first_name} {user.last_name}
            </h1>
            <div className="flex items-center space-x-4">
                <span className={getStatusBadgeStyle(user.is_active)}>
                  {user.is_active ? <CheckCircle size={14} className="mr-1" /> : <Ban size={14} className="mr-1" />}
                  {user.is_active ? 'Active' : 'Deactivated'}
                </span>
                <button
                  onClick={handleToggleActiveStatus}
                  disabled={isSubmitting}
                  className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-white transition-all shadow-md min-w-[150px]
                    ${user.is_active
                      ? 'bg-red-500 hover:bg-red-600'
                      : 'bg-green-500 hover:bg-green-600'
                    }
                  `}
                >
                  <Ban size={16} />
                  {isSubmitting
                    ? 'Processing...'
                    : user.is_active ? 'Deactivate Account' : 'Activate Account'}
                </button>
            </div>
          </div>
        </div>


      <div className="bg-white p-8 rounded-2xl shadow-xl">
        <form onSubmit={formik.handleSubmit} className="space-y-6">
          <h2 className="text-xl font-semibold border-b pb-2 mb-4 text-[#C9A35D]">Personal Information</h2>

          {/* Row 1: First Name / Last Name */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="first_name" className="flex items-center text-sm font-medium text-gray-700 mb-1"><User size={16} className="mr-2 text-gray-400" />First Name</label>
              <input
                id="first_name"
                name="first_name"
                type="text"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.first_name}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A35D] focus:border-transparent"
              />
              {formik.touched.first_name && formik.errors.first_name && (
                <div className="text-red-500 text-xs mt-1">{formik.errors.first_name}</div>
              )}
            </div>
            <div>
              <label htmlFor="last_name" className="flex items-center text-sm font-medium text-gray-700 mb-1"><User size={16} className="mr-2 text-gray-400" />Last Name</label>
              <input
                id="last_name"
                name="last_name"
                type="text"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.last_name}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A35D] focus:border-transparent"
              />
              {formik.touched.last_name && formik.errors.last_name && (
                <div className="text-red-500 text-xs mt-1">{formik.errors.last_name}</div>
              )}
            </div>
          </div>

          {/* Row 2: Username / Email */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="username" className="flex items-center text-sm font-medium text-gray-700 mb-1"><Lock size={16} className="mr-2 text-gray-400" />Username</label>
              <input
                id="username"
                name="username"
                type="text"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.username}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A35D] focus:border-transparent"
              />
              {formik.touched.username && formik.errors.username && (
                <div className="text-red-500 text-xs mt-1">{formik.errors.username}</div>
              )}
            </div>
            <div>
              <label htmlFor="email" className="flex items-center text-sm font-medium text-gray-700 mb-1"><Mail size={16} className="mr-2 text-gray-400" />Email</label>
              <input
                id="email"
                name="email"
                type="email"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.email}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A35D] focus:border-transparent"
              />
              {formik.touched.email && formik.errors.email && (
                <div className="text-red-500 text-xs mt-1">{formik.errors.email}</div>
              )}
            </div>
          </div>

          {/* Row 3: Phone Numbers */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="primary_phone_no" className="flex items-center text-sm font-medium text-gray-700 mb-1"><Phone size={16} className="mr-2 text-gray-400" />Primary Phone</label>
              <input
                id="primary_phone_no"
                name="primary_phone_no"
                type="text"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.primary_phone_no}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A35D] focus:border-transparent"
              />
              {formik.touched.primary_phone_no && formik.errors.primary_phone_no && (
                <div className="text-red-500 text-xs mt-1">{formik.errors.primary_phone_no}</div>
              )}
            </div>
            <div>
              <label htmlFor="secondary_phone_no" className="flex items-center text-sm font-medium text-gray-700 mb-1"><Phone size={16} className="mr-2 text-gray-400" />Secondary Phone (Optional)</label>
              <input
                id="secondary_phone_no"
                name="secondary_phone_no"
                type="text"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.secondary_phone_no || ''}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A35D] focus:border-transparent"
              />
              {formik.touched.secondary_phone_no && formik.errors.secondary_phone_no && (
                <div className="text-red-500 text-xs mt-1">{formik.errors.secondary_phone_no}</div>
              )}
            </div>
          </div>

          {/* Action Button */}
          <div className="pt-6 border-t mt-8 flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting || !formik.isValid || !formik.dirty}
              className="flex items-center justify-center gap-2 px-6 py-2 rounded-lg
                bg-gradient-to-r from-[#C9A35D] to-[#b18e4e]
                text-white hover:from-[#b18e4e] hover:to-[#9c7b43]
                transition-all shadow-md min-w-[150px] disabled:opacity-50"
            >
              <Save size={16} />
              {isSubmitting ? 'Saving...' : 'Save All Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminUserDetailPage;