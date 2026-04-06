import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../utils/axiosInstance";

export const fetchPublicStats = createAsyncThunk(
  "publicStats/fetchPublicStats",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get("/api/public/stats");
      return data.data || data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const fetchVolunteerStats = createAsyncThunk(
  "publicStats/fetchVolunteerStats",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get("/api/volunteer/profession-stats");
      return Array.isArray(data) ? data : (data.data || []);
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

const publicStatsSlice = createSlice({
  name: "publicStats",
  initialState: {
    stats: null,
    volunteerStats: [],
    statsStatus: "idle",
    volunteerStatus: "idle",
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // fetchPublicStats
      .addCase(fetchPublicStats.pending, (state) => { state.statsStatus = "loading"; })
      .addCase(fetchPublicStats.fulfilled, (state, action) => {
        state.statsStatus = "succeeded";
        state.stats = action.payload;
      })
      .addCase(fetchPublicStats.rejected, (state, action) => {
        state.statsStatus = "failed";
        state.error = action.payload;
      })
      // fetchVolunteerStats
      .addCase(fetchVolunteerStats.pending, (state) => { state.volunteerStatus = "loading"; })
      .addCase(fetchVolunteerStats.fulfilled, (state, action) => {
        state.volunteerStatus = "succeeded";
        state.volunteerStats = action.payload;
      })
      .addCase(fetchVolunteerStats.rejected, (state, action) => {
        state.volunteerStatus = "failed";
        state.error = action.payload;
      });
  },
});

export const selectPublicStats        = (state) => state.publicStats.stats;
export const selectVolunteerStats     = (state) => state.publicStats.volunteerStats;
export const selectPublicStatsStatus  = (state) => state.publicStats.statsStatus;

export default publicStatsSlice.reducer;
