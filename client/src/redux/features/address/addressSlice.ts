import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "../../../api/axios";

// --- Async Thunks --- //
export const fetchAddresses = createAsyncThunk(
  "address/fetchAddresses",
  async (_, thunkAPI) => {
    try {
      const response = await apiClient.get("api/addresses/");
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const addNewAddress = createAsyncThunk(
  "address/addNewAddress",
  async (addressData, thunkAPI) => {
    try {
      const response = await apiClient.post("api/addresses/", addressData);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateExistingAddress = createAsyncThunk(
  "address/updateExistingAddress",
  async ({ addressId, addressData }, thunkAPI) => {
    try {
      const response = await apiClient.put(`api/addresses/${addressId}`, addressData);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteExistingAddress = createAsyncThunk(
  "address/deleteExistingAddress",
  async (addressId, thunkAPI) => {
    try {
      await apiClient.delete(`api/addresses/${addressId}`);
      return addressId;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);

// --- Slice --- //
const addressSlice = createSlice({
  name: "address",
  initialState: {
    addresses: [],
    loading: false,
    error: null,
    currentAction: null,
  },
  reducers: {
    setDefaultAddress: (state, action) => {
      state.addresses = state.addresses.map((addr) => ({
        ...addr,
        isDefault: addr.id === action.payload,
      }));
    },
  },
  extraReducers: (builder) => {
    builder
      // fetch
      .addCase(fetchAddresses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAddresses.fulfilled, (state, action) => {
        state.loading = false;
        state.addresses = action.payload.map((addr, idx) => ({
          ...addr,
          isDefault: idx === 0, // first address default if none set
        }));
      })
      .addCase(fetchAddresses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // add
      .addCase(addNewAddress.pending, (state) => {
        state.currentAction = "adding";
      })
      .addCase(addNewAddress.fulfilled, (state, action) => {
        state.currentAction = null;
        const newAddress = { ...action.payload, isDefault: false };
        if (state.addresses.length === 0) {
          newAddress.isDefault = true;
        }
        state.addresses.push(newAddress);
      })
      .addCase(addNewAddress.rejected, (state, action) => {
        state.currentAction = null;
        state.error = action.payload;
      })

      // update
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

      // delete
      .addCase(deleteExistingAddress.pending, (state) => {
        state.currentAction = "deleting";
      })
      .addCase(deleteExistingAddress.fulfilled, (state, action) => {
        state.currentAction = null;
        state.addresses = state.addresses.filter(
          (addr) => addr.id !== action.payload
        );
        // ensure at least one default
        if (!state.addresses.some((a) => a.isDefault) && state.addresses[0]) {
          state.addresses[0].isDefault = true;
        }
      })
      .addCase(deleteExistingAddress.rejected, (state, action) => {
        state.currentAction = null;
        state.error = action.payload;
      });
  },
});

export const { setDefaultAddress } = addressSlice.actions;
export default addressSlice.reducer;
