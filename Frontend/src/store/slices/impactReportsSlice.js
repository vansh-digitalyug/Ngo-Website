import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../utils/axiosInstance";

export const fetchImpactReports = createAsyncThunk(
  "impactReports/fetchImpactReports",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get("/api/impact-reports/public");
      return Array.isArray(data) ? data : (data.data || data.reports || []);
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

/** Fetches ALL reports at once (for analytics/charts pages like OurImpact) */
export const fetchAllImpactReports = createAsyncThunk(
  "impactReports/fetchAllImpactReports",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get("/api/impact-reports/public?page=1&limit=1000");
      return Array.isArray(data) ? data : (data.data?.reports || data.data || data.reports || []);
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

const impactReportsSlice = createSlice({
  name: "impactReports",
  initialState: {
    items:     [],
    allItems:  [],
    status:    "idle",
    allStatus: "idle",
    error:     null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchImpactReports.pending, (state) => { state.status = "loading"; })
      .addCase(fetchImpactReports.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchImpactReports.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(fetchAllImpactReports.pending, (state) => { state.allStatus = "loading"; })
      .addCase(fetchAllImpactReports.fulfilled, (state, action) => {
        state.allStatus = "succeeded";
        state.allItems = action.payload;
      })
      .addCase(fetchAllImpactReports.rejected, (state, action) => {
        state.allStatus = "failed";
        state.error = action.payload;
      });
  },
});

export const selectImpactReports       = (state) => state.impactReports.items;
export const selectImpactReportsStatus = (state) => state.impactReports.status;
export const selectAllImpactReports    = (state) => state.impactReports.allItems;
export const selectAllImpactReportsStatus = (state) => state.impactReports.allStatus;

export default impactReportsSlice.reducer;

