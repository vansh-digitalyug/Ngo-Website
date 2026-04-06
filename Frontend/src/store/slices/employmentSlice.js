import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../utils/axiosInstance";

export const fetchJobs = createAsyncThunk("employment/fetchJobs", async (_, { rejectWithValue }) => {
  try {
    const { data } = await axiosInstance.get("/api/employment/");
    return Array.isArray(data) ? data : (data.data || data.jobs || []);
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

const employmentSlice = createSlice({
  name: "employment",
  initialState: { items: [], status: "idle", error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchJobs.pending, (state) => { state.status = "loading"; })
      .addCase(fetchJobs.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchJobs.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export const selectJobs       = (state) => state.employment.items;
export const selectJobsStatus = (state) => state.employment.status;

export default employmentSlice.reducer;
