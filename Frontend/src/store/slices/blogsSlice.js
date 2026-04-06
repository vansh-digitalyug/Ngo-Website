import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../utils/axiosInstance";

export const fetchBlogs = createAsyncThunk("blogs/fetchBlogs", async (_, { rejectWithValue }) => {
  try {
    const { data } = await axiosInstance.get("/api/blogs/get-all-blog");
    return Array.isArray(data.data) ? data.data : [];
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

const blogsSlice = createSlice({
  name: "blogs",
  initialState: { items: [], status: "idle", error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchBlogs.pending, (state) => { state.status = "loading"; })
      .addCase(fetchBlogs.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchBlogs.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export const selectBlogs       = (state) => state.blogs.items;
export const selectBlogsStatus = (state) => state.blogs.status;
export const selectBlogsError  = (state) => state.blogs.error;

export default blogsSlice.reducer;
