import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../utils/axiosInstance";

export const fetchPublicSurveys = createAsyncThunk(
  "surveys/fetchPublicSurveys",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get("/api/surveys/public");
      return Array.isArray(data) ? data : (data.data?.surveys || data.data || data.surveys || []);
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

const surveysSlice = createSlice({
  name: "surveys",
  initialState: { items: [], status: "idle", error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPublicSurveys.pending, (state) => { state.status = "loading"; })
      .addCase(fetchPublicSurveys.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchPublicSurveys.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export const selectSurveys       = (state) => state.surveys.items;
export const selectSurveysStatus = (state) => state.surveys.status;

export default surveysSlice.reducer;
