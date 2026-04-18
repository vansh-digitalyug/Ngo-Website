import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Build API URL - ensure it ends with /api
const getApiUrl = () => {
  let baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
  // Remove trailing slash if present
  baseUrl = baseUrl.replace(/\/$/, '');
  // Add /api if not already present
  if (!baseUrl.endsWith('/api')) {
    baseUrl += '/api';
  }
  return baseUrl;
};

const API_URL = getApiUrl();

// ─── Async Thunks ────────────────────────────────────────────────────────────
export const checkRegistration = createAsyncThunk(
  'registration/checkRegistration',
  async (eventId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return { eventId, isRegistered: false, registration: null };
      }

      const response = await fetch(`${API_URL}/registrations/${eventId}/check`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to check registration');
      }

      const data = await response.json();
      // ✅ Return eventId so reducer knows which event this is for
      return { ...data, eventId };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const registerForEvent = createAsyncThunk(
  'registration/registerForEvent',
  async (formData, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return rejectWithValue('User not authenticated');
      }

      const response = await fetch(`${API_URL}/registrations/register`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      // ✅ Return eventId so reducer knows which event was registered
      return { ...data, eventId: formData.eventId };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const cancelRegistration = createAsyncThunk(
  'registration/cancelRegistration',
  async (eventId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return rejectWithValue('User not authenticated');
      }

      const response = await fetch(`${API_URL}/registrations/${eventId}/cancel`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Cancellation failed');
      }

      // ✅ Return eventId for per-event state management
      return { ...data, eventId };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const getUserRegistrations = createAsyncThunk(
  'registration/getUserRegistrations',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return { registrations: [] };
      }

      const response = await fetch(`${API_URL}/registrations/user/registrations`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch registrations');
      }

      return await response.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// ─── Slice ───────────────────────────────────────────────────────────────────
const initialState = {
  registrationByEvent: {}, // Map of eventId -> { isRegistered, registration }
  currentEventRegistration: {
    isRegistered: false,
    registration: null
  },
  allUserRegistrations: [],
  loading: false,
  error: null,
  success: false,
  currentEventId: null // Track which event we're currently checking
};

const registrationSlice = createSlice({
  name: 'registration',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = false;
    },
    resetRegistration: (state) => {
      state.currentEventRegistration = initialState.currentEventRegistration;
    },
    setCurrentEventId: (state, action) => {
      state.currentEventId = action.payload;
    }
  },
  extraReducers: (builder) => {
    // Check registration
    builder
      .addCase(checkRegistration.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkRegistration.fulfilled, (state, action) => {
        state.loading = false;
        // ✅ Use eventId from payload to store in correct bucket (no cross-contamination!)
        if (action.payload.eventId) {
          state.registrationByEvent[action.payload.eventId] = action.payload;
        }
        state.currentEventRegistration = action.payload;
      })
      .addCase(checkRegistration.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Register for event
    builder
      .addCase(registerForEvent.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(registerForEvent.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        // ✅ Update per-event registration status
        if (action.payload.eventId) {
          state.registrationByEvent[action.payload.eventId] = {
            isRegistered: true,
            registration: action.payload.registration
          };
        }
        state.currentEventRegistration.isRegistered = true;
        state.currentEventRegistration.registration = action.payload.registration;
      })
      .addCase(registerForEvent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Cancel registration
    builder
      .addCase(cancelRegistration.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(cancelRegistration.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        // ✅ Clear per-event registration status
        if (action.payload.eventId) {
          state.registrationByEvent[action.payload.eventId] = {
            isRegistered: false,
            registration: null
          };
        }
        state.currentEventRegistration = initialState.currentEventRegistration;
      })
      .addCase(cancelRegistration.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Get user registrations
    builder
      .addCase(getUserRegistrations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUserRegistrations.fulfilled, (state, action) => {
        state.loading = false;
        state.allUserRegistrations = action.payload.registrations || [];
      })
      .addCase(getUserRegistrations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearError, clearSuccess, resetRegistration, setCurrentEventId } = registrationSlice.actions;

// Selectors
export const selectIsRegistered = (state) => state.registration.currentEventRegistration.isRegistered;
export const selectCurrentRegistration = (state) => state.registration.currentEventRegistration.registration;
export const selectRegistrationLoading = (state) => state.registration.loading;
export const selectRegistrationError = (state) => state.registration.error;
export const selectRegistrationSuccess = (state) => state.registration.success;
export const selectAllUserRegistrations = (state) => state.registration.allUserRegistrations;

// NEW: Selector that takes eventId and returns registration status for that specific event
export const selectIsRegisteredForEvent = (state, eventId) => {
  if (!eventId) return false;
  return state.registration.registrationByEvent[eventId]?.isRegistered ?? false;
};

export default registrationSlice.reducer;
