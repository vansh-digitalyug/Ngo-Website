import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../utils/axiosInstance";

export const fetchFundSummary = createAsyncThunk(
  "fundLedger/fetchFundSummary",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get("/api/fund-ledger/public/summary");
      return data.data || data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

const fundLedgerSlice = createSlice({
  name: "fundLedger",
  initialState: { summary: null, status: "idle", error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchFundSummary.pending, (state) => { state.status = "loading"; })
      .addCase(fetchFundSummary.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.summary = action.payload;
      })
      .addCase(fetchFundSummary.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export const selectFundSummary       = (state) => state.fundLedger.summary;
export const selectFundSummaryStatus = (state) => state.fundLedger.status;

export default fundLedgerSlice.reducer;
