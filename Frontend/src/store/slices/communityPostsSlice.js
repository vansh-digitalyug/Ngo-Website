import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../utils/axiosInstance";

export const fetchCommunityPosts = createAsyncThunk(
  "communityPosts/fetchCommunityPosts",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get("/api/posts/");
      return Array.isArray(data) ? data : (data.data || data.posts || []);
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const fetchPostById = createAsyncThunk(
  "communityPosts/fetchPostById",
  async (id, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const { data } = await axiosInstance.get(`/api/posts/${id}`, { headers });
      return data.data || data.post || data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

const communityPostsSlice = createSlice({
  name: "communityPosts",
  initialState: {
    items: [],
    status: "idle",
    error: null,
    selectedPost: null,
    postStatus: "idle",
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCommunityPosts.pending, (state) => { state.status = "loading"; })
      .addCase(fetchCommunityPosts.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchCommunityPosts.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      // fetchPostById
      .addCase(fetchPostById.pending, (state) => { state.postStatus = "loading"; })
      .addCase(fetchPostById.fulfilled, (state, action) => {
        state.postStatus = "succeeded";
        state.selectedPost = action.payload;
      })
      .addCase(fetchPostById.rejected, (state, action) => {
        state.postStatus = "failed";
        state.error = action.payload;
      });
  },
});

export const selectCommunityPosts       = (state) => state.communityPosts.items;
export const selectCommunityPostsStatus = (state) => state.communityPosts.status;
export const selectSelectedPost         = (state) => state.communityPosts.selectedPost;
export const selectPostStatus           = (state) => state.communityPosts.postStatus;

export default communityPostsSlice.reducer;
