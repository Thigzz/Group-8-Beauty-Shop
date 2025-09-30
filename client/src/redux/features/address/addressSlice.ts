import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "../../../api/axios";

// --- Async Thunks --- //

// Fetch all addresses for the current user
export const fetchAddresses = createAsyncThunk(
  "address/fetchAddresses",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get("/api/addresses/");
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Add a new address
export const addNewAddress = createAsyncThunk(
  "address/addNewAddress",
  async (addressData, { dispatch, rejectWithValue }) => {
    try {
      const response = await apiClient.post("/api/addresses/", addressData);
      dispatch(fetchAddresses());
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Update an existing address
export const updateExistingAddress = createAsyncThunk(
  "address/updateExistingAddress",
  async ({ addressId, addressData }, { rejectWithValue }) => {
    try {
      const response = await apiClient.put(`/api/addresses/${addressId}`, addressData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Deletes an address
export const deleteExistingAddress = createAsyncThunk(
  "address/deleteExistingAddress",
  async (addressId, { rejectWithValue }) => {
    try {
      await apiClient.delete(`/api/addresses/${addressId}`);
      return addressId;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Sets an address as the default for shipping
export const setDefaultAddress = createAsyncThunk(
  "address/setDefaultAddress",
  async (addressId, { dispatch, rejectWithValue }) => {
    try {

      const response = await apiClient.put(`/api/addresses/${addressId}/set-default`);

      dispatch(fetchAddresses());
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Could not set default address.');
    }
  }
);


// --- Slice Definition --- //
const addressSlice = createSlice({
  name: "address",
  initialState: {
    addresses: [],
    defaultAddress: null,
    loading: false,
    error: null,
    currentAction: null,
  },
  reducers: {

  },
  extraReducers: (builder) => {
    builder
      // FETCH
      .addCase(fetchAddresses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAddresses.fulfilled, (state, action) => {
        state.loading = false;
        state.addresses = action.payload;
        state.defaultAddress = action.payload.find(addr => addr.is_default) || action.payload[0] || null;
      })
      .addCase(fetchAddresses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ADD
      .addCase(addNewAddress.pending, (state) => {
        state.currentAction = "adding";
      })
      .addCase(addNewAddress.fulfilled, (state, action) => {
        state.currentAction = null;
      })
      .addCase(addNewAddress.rejected, (state, action) => {
        state.currentAction = null;
        state.error = action.payload;
      })

      // UPDATE
      .addCase(updateExistingAddress.pending, (state) => {
        state.currentAction = "editing";
      })
      .addCase(updateExistingAddress.fulfilled, (state, action) => {
        state.currentAction = null;
        state.addresses = state.addresses.map((addr) =>
          addr.id === action.payload.id ? { ...addr, ...action.payload } : addr
        );
      })
      .addCase(updateExistingAddress.rejected, (state, action) => {
        state.currentAction = null;
        state.error = action.payload;
      })

      // DELETE
      .addCase(deleteExistingAddress.pending, (state) => {
        state.currentAction = "deleting";
      })
      .addCase(deleteExistingAddress.fulfilled, (state, action) => {
        state.currentAction = null;
        state.addresses = state.addresses.filter(
          (addr) => addr.id !== action.payload
        );
        if (!state.addresses.some((a) => a.is_default) && state.addresses[0]) {
          state.defaultAddress = state.addresses[0];
        }
      })
      .addCase(deleteExistingAddress.rejected, (state, action) => {
        state.currentAction = null;
        state.error = action.payload;
      })
      
      // SET DEFAULT
      .addCase(setDefaultAddress.fulfilled, (state, action) => {
      });
  },
});

export default addressSlice.reducer;