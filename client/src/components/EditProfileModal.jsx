import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateUserProfile } from '../redux/features/auth/authSlice';

const EditProfileModal = ({ isOpen, onClose, onSuccess }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    primary_phone_no: '',
    secondary_phone_no: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Prefill form with latest user data whenever modal opens
  useEffect(() => {
    if (isOpen && user) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        primary_phone_no: user.primary_phone_no || '',
        secondary_phone_no: user.secondary_phone_no || ''
      });
      setError('');
    }
  }, [isOpen, user]);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    setLoading(true);
    setIsSubmitting(true);
    setError('');

    try {
      const resultAction = await dispatch(updateUserProfile(formData));

      if (updateUserProfile.fulfilled.match(resultAction)) {
        // Only call onSuccess - no duplicate toast in thunk anymore
        onSuccess?.('Profile updated successfully!');
        onClose(); // Close modal immediately
      } else {
        setError(resultAction.payload || 'Failed to update profile');
      }
    } catch (err) {
      setError('Failed to update profile');
    } finally {
      setLoading(false);
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
      onClick={handleClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden animate-slide-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-8 border-b border-gray-200 bg-gray-50">
          <h3 className="text-3xl font-bold text-gray-900">Edit Profile</h3>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 transition-colors p-2 rounded-full hover:bg-gray-200"
            disabled={loading}
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg text-base">
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {error}
                </div>
              </div>
            )}

            {/* Form fields */}
            {['first_name', 'last_name', 'email', 'primary_phone_no', 'secondary_phone_no'].map((field) => (
              <div key={field}>
                <label className="block text-lg font-semibold text-gray-800 mb-3">
                  {field.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}{field !== 'secondary_phone_no' ? ' *' : ''}
                </label>
                <input
                  type={field.includes('email') ? 'email' : 'text'}
                  name={field}
                  value={formData[field]}
                  onChange={handleChange}
                  className="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#C9A35D] focus:border-transparent transition-all duration-200"
                  placeholder={field === 'secondary_phone_no' ? 'Optional' : ''}
                  required={field !== 'secondary_phone_no'}
                />
              </div>
            ))}

            {/* Buttons */}
            <div className="flex space-x-4 pt-6">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 px-6 py-4 border-2 border-gray-300 text-gray-700 text-lg font-semibold rounded-xl hover:bg-gray-50 transition-all duration-200"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-4 bg-[#C9A35D] text-black text-lg font-bold rounded-xl hover:opacity-90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProfileModal;