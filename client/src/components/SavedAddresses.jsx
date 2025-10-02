import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchAddresses,
  deleteExistingAddress,
  setDefaultAddress,
} from "../redux/features/address/addressSlice";
import { MapPin, Edit2, Trash2, Star, Plus, CheckCircle } from "lucide-react";

const SavedAddresses = ({ onAction }) => {
  const dispatch = useDispatch();
  const { addresses, loading, error } = useSelector(
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

  const handleSetDefault = async (id) => {
    try {
      await dispatch(setDefaultAddress(id)).unwrap();
    } catch (error) {
      console.error("Failed to set default address:", error);
    }
  };

  if (loading && addresses.length === 0)
    return <div className="p-6 text-center">Loading addresses...</div>;

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
  const defaultAddress = addresses.find(addr => addr.isDefault);
  const otherAddresses = addresses.filter(addr => !addr.isDefault);

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
      {defaultAddress && (
        <div className="relative">
          <div className="mb-3 flex items-center gap-2 text-sm font-medium text-gray-700">
            <CheckCircle size={16} className="text-green-600" />
            Primary Delivery Address
          </div>

          <div className="relative p-6 rounded-xl border-2 border-[#C9A35D] bg-amber-50 shadow-lg">

            {/* Default Badge */}
              <div className="absolute -top-3 left-4 flex items-center gap-1 bg-[#C9A35D] text-black px-3 py-1 rounded-full text-sm font-medium">
                <Star size={14} fill="currentColor" />
                Default Address
              </div>

            {/* Address Icon and Header */}
            <div className="flex items-start gap-3 mb-4">
              <div className="p-2 bg-amber-100 rounded-lg">
                <MapPin size={20} className="text-[#C9A35D]" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                  Primary Address
                  <CheckCircle size={18} className="text-green-600" />
                </h3>
              </div>
            </div>
            <div className="space-y-2 text-gray-700 mb-4">
              <p className="font-semibold text-lg">{defaultAddress.address_line_1}</p>
              {defaultAddress.address_line_2 && (
                <p className="text-gray-600">{defaultAddress.address_line_2}</p>
              )}
              <p className="text-gray-600 font-medium">
                {defaultAddress.city}, {defaultAddress.postal_code}
              </p>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-amber-200">
              <button
                onClick={() => onAction("edit", defaultAddress)}
                className="flex items-center gap-2 text-[#C9A35D] hover:text-amber-800 font-semibold px-3 py-2 rounded-lg hover:bg-amber-100"
              >
                <Edit2 size={16} />
                Edit
              </button>
              <div className="text-sm text-amber-700 font-medium bg-amber-100 px-3 py-1 rounded-full">
                Currently Selected
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Other Addresses */}
      {otherAddresses.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Other Addresses ({otherAddresses.length})
          </h3>
          <div className="grid gap-6 md:grid-cols-2">
            {otherAddresses.map((address) => (
              <div
                key={address.id}
                className="p-6 rounded-xl border border-gray-200 bg-white hover:border-gray-300 transition-all duration-300"
              >
            

            {/* Address Details */}
            <div className="space-y-2 text-gray-700 mb-4">
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

                <button
                  onClick={() => handleSetDefault(address.id)}
                  className="flex items-center gap-2 text-gray-700 hover:text-gray-900 font-medium text-sm bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-lg"
                >
                  <Star size={14} />
                  Set Default
                </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )}

      {/* Empty State */}
      {addresses.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <MapPin size={40} className="text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No addresses yet
          </h3>
          <p className="text-gray-600 mb-6">
            Add your first address to get started
          </p>
          <button
            onClick={() => onAction("add")}
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#C9A35D] text-black font-bold rounded-lg hover:opacity-90"
          >
            <Plus size={20} />
            Add Your First Address
          </button>
        </div>
      )}
    </div>
  );
};

export default SavedAddresses;