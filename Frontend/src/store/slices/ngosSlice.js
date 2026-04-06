import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../utils/axiosInstance";

export const fetchNgos = createAsyncThunk("ngos/fetchNgos", async (_, { rejectWithValue }) => {
  try {
    const { data } = await axiosInstance.get("/api/ngo/");
    return Array.isArray(data) ? data : (data.data || data.ngos || []);
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

/**
 * Filtered NGO fetch with server-side pagination and search.
 * payload: { page, limit, category, city, state, search }
 * Returns { items, total } so the page can show count + data.
 */
export const fetchNgosFiltered = createAsyncThunk(
  "ngos/fetchNgosFiltered",
  async (params = {}, { rejectWithValue }) => {
    try {
      const query = new URLSearchParams();
      query.append("page",  params.page  || 1);
      query.append("limit", params.limit || 12);
      if (params.category && params.category !== "All") query.append("category", params.category);
      if (params.city  && params.city  !== "All") query.append("city",  params.city);
      if (params.state && params.state !== "All") query.append("state", params.state);
      if (params.search) query.append("search", params.search);
      const { data } = await axiosInstance.get(`/api/ngo?${query.toString()}`);
      if (!data.success) throw new Error(data.message || "Failed to load NGO data");
      return { items: data.data || [], total: data.total || data.data?.length || 0 };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const fetchNgoById = createAsyncThunk("ngos/fetchNgoById", async (id, { rejectWithValue }) => {
  try {
    const { data } = await axiosInstance.get(`/api/ngo/${id}`);
    return data.data || data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

export const fetchNgoGallery = createAsyncThunk("ngos/fetchNgoGallery", async (id, { rejectWithValue }) => {
  try {
    const { data } = await axiosInstance.get(`/api/ngo/${id}/gallery?limit=18`);
    return Array.isArray(data) ? data : (data.data || data.gallery || []);
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

const ngosSlice = createSlice({
  name: "ngos",
  initialState: {
    items: [],
    filteredItems: [],
    filteredTotal: 0,
    filteredStatus: "idle",
    selectedNgo: null,
    ngoGallery: [],
    status: "idle",
    ngoStatus: "idle",
    galleryStatus: "idle",
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // fetchNgos
      .addCase(fetchNgos.pending, (state) => { state.status = "loading"; })
      .addCase(fetchNgos.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchNgos.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      // fetchNgosFiltered
      .addCase(fetchNgosFiltered.pending, (state) => { state.filteredStatus = "loading"; })
      .addCase(fetchNgosFiltered.fulfilled, (state, action) => {
        state.filteredStatus = "succeeded";
        state.filteredItems = action.payload.items;
        state.filteredTotal = action.payload.total;
        state.error = null;
      })
      .addCase(fetchNgosFiltered.rejected, (state, action) => {
        state.filteredStatus = "failed";
        state.error = action.payload;
      })
      // fetchNgoById
      .addCase(fetchNgoById.pending, (state) => { state.ngoStatus = "loading"; })
      .addCase(fetchNgoById.fulfilled, (state, action) => {
        state.ngoStatus = "succeeded";
        state.selectedNgo = action.payload;
      })
      .addCase(fetchNgoById.rejected, (state, action) => {
        state.ngoStatus = "failed";
        state.error = action.payload;
      })
      // fetchNgoGallery
      .addCase(fetchNgoGallery.pending, (state) => { state.galleryStatus = "loading"; })
      .addCase(fetchNgoGallery.fulfilled, (state, action) => {
        state.galleryStatus = "succeeded";
        state.ngoGallery = action.payload;
      })
      .addCase(fetchNgoGallery.rejected, (state, action) => {
        state.galleryStatus = "failed";
        state.error = action.payload;
      });
  },
});

export const selectNgos              = (state) => state.ngos.items;
export const selectNgosStatus        = (state) => state.ngos.status;
export const selectFilteredNgos      = (state) => state.ngos.filteredItems;
export const selectFilteredNgosTotal = (state) => state.ngos.filteredTotal;
export const selectFilteredNgosStatus= (state) => state.ngos.filteredStatus;
export const selectSelectedNgo       = (state) => state.ngos.selectedNgo;
export const selectNgoGallery        = (state) => state.ngos.ngoGallery;
export const selectNgoGalleryStatus  = (state) => state.ngos.galleryStatus;

export default ngosSlice.reducer;
