import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../utils/axiosInstance";

export const fetchServices = createAsyncThunk("services/fetchServices", async (_, { rejectWithValue }) => {
  try {
    const { data } = await axiosInstance.get("/api/services/");
    return data.categories || data.data || data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

const servicesSlice = createSlice({
  name: "services",
  initialState: { categories: [], status: "idle", error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchServices.pending, (state) => { state.status = "loading"; })
      .addCase(fetchServices.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.categories = action.payload;
      })
      .addCase(fetchServices.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export const selectServices       = (state) => state.services.categories;
export const selectServicesStatus = (state) => state.services.status;

export default servicesSlice.reducer;
