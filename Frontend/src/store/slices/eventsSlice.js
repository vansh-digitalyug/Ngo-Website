import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../utils/axiosInstance";

export const fetchEvents = createAsyncThunk("events/fetchEvents", async (_, { rejectWithValue }) => {
  try {
    const { data } = await axiosInstance.get("/api/events/");
    // Handle both { events: [] }, { data: [] } and direct array responses safely
    const arr = Array.isArray(data) ? data : (data.events || data.data || []);
    return arr;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

const eventsSlice = createSlice({
  name: "events",
  initialState: { items: [], status: "idle", error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchEvents.pending, (state) => { state.status = "loading"; })
      .addCase(fetchEvents.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchEvents.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export const selectEvents       = (state) => state.events.items;
export const selectEventsStatus = (state) => state.events.status;
export const selectEventsError  = (state) => state.events.error;

export default eventsSlice.reducer;
