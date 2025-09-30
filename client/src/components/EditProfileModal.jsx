import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const profileFields = useMemo(() => 
    ['first_name', 'last_name', 'email', 'primary_phone_no', 'secondary_phone_no'], 
  []);

  const fieldLabels = useMemo(() => ({
    first_name: 'First Name',
    last_name: 'Last Name',
    email: 'Email Address',
    primary_phone_no: 'Primary Phone Number',
    secondary_phone_no: 'Secondary Phone Number'
  }), []);

  const formatPhoneNumber = useCallback((value) => {
    if (!value) return '';
    
    if (value.startsWith('+')) {
      return value.replace(/[^\d+]/g, '');
    }
    
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 6) return `(${numbers.slice(0, 3)}) ${numbers.slice(3)}`;
    if (numbers.length <= 10) return `(${numbers.slice(0, 3)}) ${numbers.slice(3, 6)}-${numbers.slice(6, 10)}`;
    
    return `+${numbers}`;
  }, []);

  useEffect(() => {
    if (isOpen && user) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        primary_phone_no: user.primary_phone_no ? formatPhoneNumber(user.primary_phone_no) : '',
        secondary_phone_no: user.secondary_phone_no ? formatPhoneNumber(user.secondary_phone_no) : ''
      });
      setError('');
      setSuccess('');
      setErrors({});
    }
  }, [isOpen, user, formatPhoneNumber]);

  const validateForm = useCallback(() => {
    const newErrors = {};
    
    if (!formData.first_name?.trim()) {
      newErrors.first_name = 'First name is required';
    }
    
    if (!formData.last_name?.trim()) {
      newErrors.last_name = 'Last name is required';
    }
    
    if (!formData.email?.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.primary_phone_no?.trim()) {
      newErrors.primary_phone_no = 'Primary phone number is required';
    } else {
      const phoneValue = formData.primary_phone_no.trim();
      if (phoneValue.startsWith('+')) {
        const phoneDigits = phoneValue.replace(/[^\d]/g, '');
        if (phoneDigits.length < 10) {
          newErrors.primary_phone_no = 'Please enter a valid international phone number';
        }
      } else {
        const phoneDigits = phoneValue.replace(/\D/g, '');
        if (phoneDigits.length !== 10) {
          newErrors.primary_phone_no = 'Please enter a valid 10-digit phone number';
        }
      }
    }

    if (formData.secondary_phone_no?.trim()) {
      const phoneValue = formData.secondary_phone_no.trim();
      if (phoneValue.startsWith('+')) {
        const phoneDigits = phoneValue.replace(/[^\d]/g, '');
        if (phoneDigits.length < 10) {
          newErrors.secondary_phone_no = 'Please enter a valid international phone number';
        }
      } else {
        const phoneDigits = phoneValue.replace(/\D/g, '');
        if (phoneDigits.length !== 10 && phoneDigits.length > 0) {
          newErrors.secondary_phone_no = 'Please enter a valid 10-digit phone number';
        }
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleChange = useCallback((e) => {
    let value = e.target.value;
    const fieldName = e.target.name;
    
    if (fieldName.includes('phone_no')) {
      value = formatPhoneNumber(value);
    }
    
    setFormData(prev => ({ ...prev, [fieldName]: value }));
    
    if (error) setError('');
    if (success) setSuccess('');
    
    if (errors[fieldName]) {
      setErrors(prev => ({ ...prev, [fieldName]: '' }));
    }
  }, [error, errors, formatPhoneNumber, success]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!validateForm()) return;

    setLoading(true);
    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const submissionData = {
        ...formData,
        primary_phone_no: formData.primary_phone_no.startsWith('+') 
          ? formData.primary_phone_no.replace(/[^\d+]/g, '') 
          : formData.primary_phone_no.replace(/\D/g, ''),
        secondary_phone_no: formData.secondary_phone_no.startsWith('+') 
          ? formData.secondary_phone_no.replace(/[^\d+]/g, '') 
          : formData.secondary_phone_no.replace(/\D/g, '')
      };

      const resultAction = await dispatch(updateUserProfile(submissionData));

      if (updateUserProfile.fulfilled.match(resultAction)) {
        onSuccess?.('Profile updated successfully!');
        onClose();
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

  const handleClose = useCallback(() => {
    setError('');
    setSuccess('');
    setErrors({});
    onClose();
  }, [onClose]);

  useEffect(() => {
    const handleEscapeKey = (e) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'hidden'; 
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, handleClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-profile-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={handleClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden animate-slide-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50">
          <h3 id="edit-profile-title" className="text-2xl font-bold text-gray-900">
            Edit Profile
          </h3>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 transition-colors p-2 rounded-full hover:bg-gray-200"
            disabled={loading}
            aria-label="Close modal"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {error && (
              <div 
                className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-base"
                role="alert"
                aria-live="polite"
              >
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {error}
                </div>
              </div>
            )}

            {/* Form fields */}
            {profileFields.map((field) => (
              <div key={field}>
                <label 
                  htmlFor={field}
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  {fieldLabels[field]}
                </label>
                <input
                  id={field}
                  name={field}
                  value={formData[field]}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 text-base border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C9A35D] focus:border-transparent transition-all duration-200 ${
                    errors[field] 
                      ? 'border-red-300 bg-red-50' 
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  placeholder={field === 'secondary_phone_no' ? 'Optional' : ''}
                  required={field !== 'secondary_phone_no'}
                  aria-describedby={errors[field] ? `${field}-error` : undefined}
                  aria-invalid={errors[field] ? 'true' : 'false'}
                  disabled={loading}
                />
                {errors[field] && (
                  <p 
                    id={`${field}-error`} 
                    className="text-red-600 text-sm mt-1 flex items-center"
                    role="alert"
                  >
                    <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors[field]}
                  </p>
                )}
              </div>
            ))}

            {/* Buttons */}
            <div className="flex space-x-4 pt-4">
              <button
                type="button"
                onClick={handleClose}
                disabled={loading}
                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 text-base font-medium rounded-lg hover:bg-gray-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || isSubmitting}
                className="flex-1 px-6 py-3 bg-[#C9A35D] text-white text-base font-semibold rounded-lg hover:bg-[#B8934C] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </span>
                ) : (
                  'Save Changes'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default React.memo(EditProfileModal);