import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addNewAddress, updateExistingAddress } from '../redux/features/address/addressSlice';

const AddressForm = ({ mode, address, onSuccess, onCancel }) => {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.address);
  
  const [formData, setFormData] = useState({
    address_line_1: '',
    address_line_2: '',
    city: '',
    postal_code: '',
    isDefault: false
  });

  useEffect(() => {
    if (mode === 'edit' && address) {
      console.log('Prefilling form with:', address);
      setFormData({
        address_line_1: address.address_line_1 || '',
        address_line_2: address.address_line_2 || '',
        city: address.city || '',
        postal_code: address.postal_code || '',
        isDefault: address.isDefault || false
      });
    } else {
      setFormData({
        address_line_1: '',
        address_line_2: '',
        city: '',
        postal_code: '',
        isDefault: false
      });
    }
  }, [mode, address]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (mode === 'edit') {
        await dispatch(updateExistingAddress({ 
          addressId: address.id, 
          addressData: formData 
        })).unwrap();
      } else {
        await dispatch(addNewAddress(formData)).unwrap();
      }
      onSuccess();
    } catch (error) {
      console.error('Error saving address:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 1</label>
        <input
          type="text"
          name="address_line_1"
          value={formData.address_line_1}
          onChange={handleChange}
          required
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A35D] focus:border-transparent"
          placeholder="Enter address line 1"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 2 (Optional)</label>
        <input
          type="text"
          name="address_line_2"
          value={formData.address_line_2}
          onChange={handleChange}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A35D] focus:border-transparent"
          placeholder="Enter address line 2"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
          <input
            type="text"
            name="city"
            value={formData.city}
            onChange={handleChange}
            required
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A35D] focus:border-transparent"
            placeholder="Enter city"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
          <input
            type="text"
            name="postal_code"
            value={formData.postal_code}
            onChange={handleChange}
            required
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A35D] focus:border-transparent"
            placeholder="Enter postal code"
          />
        </div>
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          name="isDefault"
          checked={formData.isDefault}
          onChange={handleChange}
          className="h-4 w-4 text-[#C9A35D] focus:ring-[#C9A35D] border-gray-300 rounded"
        />
        <label className="ml-2 block text-sm text-gray-700">Set as default address</label>
      </div>

      {error && (
        <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
          Error: {error}
        </div>
      )}

      <div className="flex gap-3 pt-4">
        <button 
          type="submit" 
          disabled={loading}
          className="flex-1 bg-[#C9A35D] text-black font-bold py-3 rounded-lg hover:opacity-90 disabled:opacity-50"
        >
          {loading ? 'Saving...' : mode === 'edit' ? 'Update Address' : 'Add Address'}
        </button>
        <button 
          type="button" 
          onClick={onCancel}
          className="flex-1 bg-gray-300 text-gray-700 font-bold py-3 rounded-lg hover:bg-gray-400"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default AddressForm;