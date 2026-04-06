import { configureStore } from "@reduxjs/toolkit";
import ourStoryReducer from "./slices/ourStorySlice";
import blogsReducer from "./slices/blogsSlice";
import eventsReducer from "./slices/eventsSlice";
import galleryReducer from "./slices/gallerySlice";
import ngosReducer from "./slices/ngosSlice";
import servicesReducer from "./slices/servicesSlice";
import publicStatsReducer from "./slices/publicStatsSlice";
import fundLedgerReducer from "./slices/fundLedgerSlice";
import surveysReducer from "./slices/surveysSlice";
import employmentReducer from "./slices/employmentSlice";
import communityPostsReducer from "./slices/communityPostsSlice";
import impactReportsReducer from "./slices/impactReportsSlice";
import villagesReducer from "./slices/villagesSlice";

const store = configureStore({
  reducer: {
    ourStory: ourStoryReducer,
    blogs: blogsReducer,
    events: eventsReducer,
    gallery: galleryReducer,
    ngos: ngosReducer,
    services: servicesReducer,
    publicStats: publicStatsReducer,
    fundLedger: fundLedgerReducer,
    surveys: surveysReducer,
    employment: employmentReducer,
    communityPosts: communityPostsReducer,
    impactReports: impactReportsReducer,
    villages: villagesReducer,
  },
});

export default store;
