import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchAddresses,
  deleteExistingAddress,
  setDefaultAddress,
} from "../redux/features/address/addressSlice";
import { MapPin, Edit2, Trash2, Star, Plus } from "lucide-react";

const SavedAddresses = ({ onAction }) => {
  const dispatch = useDispatch();
  const { addresses, loading, error, currentAction } = useSelector(
    (state) => state.address
  );

  useEffect(() => {
    dispatch(fetchAddresses());
  }, [dispatch]);

  const handleDeleteAddress = async (id) => {
    if (window.confirm("Are you sure you want to delete this address?")) {
      await dispatch(deleteExistingAddress(id));
    }
  };

  if (loading && addresses.length === 0)
    return <div className="p-6 text-center">Loading...</div>;

  if (error && addresses.length === 0)
    return (
      <div className="p-6 text-center text-red-600">
        Error loading addresses: {error}
        <button
          onClick={() => dispatch(fetchAddresses())}
          className="ml-3 px-4 py-2 bg-[#C9A35D] text-black font-bold rounded-lg hover:opacity-90 transition-all duration-200"
        >
          Retry
        </button>
      </div>
    );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center pb-4 border-b border-gray-200">
        <div>
          <p className="text-gray-600 mt-1">Manage your delivery addresses</p>
        </div>
        <button
          onClick={() => onAction("add")}
          className="flex items-center gap-2 px-4 py-3 bg-[#C9A35D] text-black font-bold rounded-lg hover:opacity-90 transition-all duration-200 shadow-md hover:shadow-lg"
        >
          <Plus size={20} />
          Add New Address
        </button>
      </div>

      {/* Address Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {addresses.map((address) => (
          <div
            key={address.id}
            className={`relative p-6 rounded-xl transition-all duration-300 hover:shadow-lg ${
              address.isDefault 
                ? 'border-2 border-[#C9A35D] bg-gradient-to-br from-amber-50 to-white' 
                : 'border border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            {/* Default Badge */}
            {address.isDefault && (
              <div className="absolute -top-3 left-4 flex items-center gap-1 bg-[#C9A35D] text-black px-3 py-1 rounded-full text-sm font-medium">
                <Star size={14} fill="currentColor" />
                Default Address
              </div>
            )}

            {/* Address Icon and Header */}
            <div className="flex items-start gap-3 mb-4">
              <div className="p-2 bg-gray-100 rounded-lg">
                <MapPin size={20} className="text-[#C9A35D]" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 text-lg">Delivery Address</h3>
              </div>
            </div>

            {/* Address Details */}
            <div className="space-y-2 text-gray-700">
              <p className="font-medium">{address.address_line_1}</p>
              {address.address_line_2 && (
                <p className="text-gray-600">{address.address_line_2}</p>
              )}
              <p className="text-gray-600">
                {address.city}, {address.postal_code}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
              <div className="flex gap-3">
                <button
                  onClick={() => onAction("edit", address)}
                  className="flex items-center gap-1 text-[#C9A35D] hover:text-amber-700 font-medium transition-colors"
                >
                  <Edit2 size={16} />
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteAddress(address.id)}
                  className="flex items-center gap-1 text-red-600 hover:text-red-800 font-medium transition-colors"
                >
                  <Trash2 size={16} />
                  Delete
                </button>
              </div>
              
              {!address.isDefault && (
                <button
                  onClick={() => dispatch(setDefaultAddress(address.id))}
                  className="text-gray-600 hover:text-gray-800 font-medium text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-md transition-colors"
                >
                  Set Default
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {addresses.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <MapPin size={40} className="text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No addresses yet</h3>
          <p className="text-gray-600 mb-6">Add your first address to get started</p>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              onAction("add");
            }}
            className="inline-flex items-center gap-2 text-[#C9A35D] hover:text-amber-700 font-medium underline underline-offset-4 hover:no-underline transition-all duration-200"
          >
            <Plus size={20} />
            Add Your First Address
          </a>
        </div>
      )}
    </div>
  );
};

export default SavedAddresses;