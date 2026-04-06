import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../utils/axiosInstance";

export const fetchVillages = createAsyncThunk("villages/fetchVillages", async (_, { rejectWithValue }) => {
  try {
    const { data } = await axiosInstance.get("/api/villages/");
    return Array.isArray(data) ? data : (data.data || data.villages || []);
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

export const fetchVillageById = createAsyncThunk(
  "villages/fetchVillageById",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get(`/api/villages/${id}`);
      return data.data || data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const fetchVillageProblems = createAsyncThunk(
  "villages/fetchVillageProblems",
  async ({ id, params = "" }, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get(`/api/villages/${id}/problems${params ? `?${params}` : ""}`);
      return Array.isArray(data) ? data : (data.data || data.problems || []);
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

const villagesSlice = createSlice({
  name: "villages",
  initialState: {
    items: [],
    status: "idle",
    error: null,
    selectedVillage: null,
    villageStatus: "idle",
    problems: [],
    problemsStatus: "idle",
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchVillages.pending, (state) => { state.status = "loading"; })
      .addCase(fetchVillages.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchVillages.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      // fetchVillageById
      .addCase(fetchVillageById.pending, (state) => { state.villageStatus = "loading"; })
      .addCase(fetchVillageById.fulfilled, (state, action) => {
        state.villageStatus = "succeeded";
        // The API wraps the village in data.data.village or data.data
        const payload = action.payload;
        state.selectedVillage = payload?.village || payload;
      })
      .addCase(fetchVillageById.rejected, (state, action) => {
        state.villageStatus = "failed";
        state.error = action.payload;
      })
      // fetchVillageProblems
      .addCase(fetchVillageProblems.pending, (state) => { state.problemsStatus = "loading"; })
      .addCase(fetchVillageProblems.fulfilled, (state, action) => {
        state.problemsStatus = "succeeded";
        state.problems = action.payload;
      })
      .addCase(fetchVillageProblems.rejected, (state, action) => {
        state.problemsStatus = "failed";
        state.error = action.payload;
      });
  },
});

export const selectVillages              = (state) => state.villages.items;
export const selectVillagesStatus        = (state) => state.villages.status;
export const selectSelectedVillage       = (state) => state.villages.selectedVillage;
export const selectVillageStatus         = (state) => state.villages.villageStatus;
export const selectVillageProblems       = (state) => state.villages.problems;
export const selectVillageProblemsStatus = (state) => state.villages.problemsStatus;

export default villagesSlice.reducer;
