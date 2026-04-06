import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../utils/axiosInstance";

export const fetchGalleryImages = createAsyncThunk(
  "gallery/fetchGalleryImages",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get("/api/gallery/images");
      return Array.isArray(data) ? data : (data.images || data.data || []);
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const fetchGalleryVideos = createAsyncThunk(
  "gallery/fetchGalleryVideos",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get("/api/gallery/videos");
      return Array.isArray(data) ? data : (data.videos || data.data || []);
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const fetchGalleryCategories = createAsyncThunk(
  "gallery/fetchGalleryCategories",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get("/api/gallery/categories");
      return Array.isArray(data) ? data : (data.categories || data.data || []);
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

const gallerySlice = createSlice({
  name: "gallery",
  initialState: {
    images: [],
    videos: [],
    categories: [],
    imagesStatus: "idle",
    videosStatus: "idle",
    categoriesStatus: "idle",
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // images
      .addCase(fetchGalleryImages.pending, (state) => { state.imagesStatus = "loading"; })
      .addCase(fetchGalleryImages.fulfilled, (state, action) => {
        state.imagesStatus = "succeeded";
        state.images = action.payload;
      })
      .addCase(fetchGalleryImages.rejected, (state, action) => {
        state.imagesStatus = "failed";
        state.error = action.payload;
      })
      // videos
      .addCase(fetchGalleryVideos.pending, (state) => { state.videosStatus = "loading"; })
      .addCase(fetchGalleryVideos.fulfilled, (state, action) => {
        state.videosStatus = "succeeded";
        state.videos = action.payload;
      })
      .addCase(fetchGalleryVideos.rejected, (state, action) => {
        state.videosStatus = "failed";
        state.error = action.payload;
      })
      // categories
      .addCase(fetchGalleryCategories.pending, (state) => { state.categoriesStatus = "loading"; })
      .addCase(fetchGalleryCategories.fulfilled, (state, action) => {
        state.categoriesStatus = "succeeded";
        state.categories = action.payload;
      })
      .addCase(fetchGalleryCategories.rejected, (state, action) => {
        state.categoriesStatus = "failed";
        state.error = action.payload;
      });
  },
});

export const selectGalleryImages         = (state) => state.gallery.images;
export const selectGalleryVideos         = (state) => state.gallery.videos;
export const selectGalleryCategories     = (state) => state.gallery.categories;
export const selectGalleryImagesStatus   = (state) => state.gallery.imagesStatus;
export const selectGalleryVideosStatus   = (state) => state.gallery.videosStatus;

export default gallerySlice.reducer;
