import axios from 'axios';
import { generateUploadUrl, uploadfileToS3 } from './uploadService';

// Get auth token from localStorage
const getAuthToken = () => localStorage.getItem('token');

// Base API URL - uses Vite env var (same as rest of the project)
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000') + '/api';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
apiClient.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle errors globally
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      window.location.href = '/auth/login';
    }
    return Promise.reject(error);
  }
);

const communityService = {
  // ==================== COMMUNITY ENDPOINTS ====================

  /**
   * Search communities with text and geo-location filters
   * @param {Object} params - Query parameters
   * @param {string} params.search - Text search (name/description)
   * @param {number} params.lat - User latitude for geo search
   * @param {number} params.lng - User longitude for geo search
   * @param {number} params.maxDistance - Search radius in meters (default: 5000)
   * @param {string} params.city - Filter by city
   * @param {string} params.state - Filter by state
   * @param {string} params.areaType - Filter by area type (mohalla/gao/ward/colony/village)
   * @param {number} params.page - Page number (default: 1)
   * @param {number} params.limit - Results per page (default: 10)
   * @returns {Promise} List of communities
   */
  searchCommunities: async (params = {}) => {
    try {
      const response = await apiClient.get('/community', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Get all communities with filtering
   * @param {Object} params - Query parameters
   * @returns {Promise} List of communities
   */
  getAllCommunities: async (params = {}) => {
    try {
      const response = await apiClient.get('/community', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Get single community details
   * @param {string} communityId - Community ID
   * @returns {Promise} Community details with activities and responsibilities
   */
  getCommunityById: async (communityId) => {
    try {
      const response = await apiClient.get(`/community/${communityId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Register a new community (Community Leader only)
   * @param {Object} communityData - Community registration data
   * @param {string} communityData.name - Community name
   * @param {string} communityData.areaType - Area type (mohalla/gao/ward/colony/village)
   * @param {string} communityData.description - Community description
   * @param {number} communityData.latitude - Location latitude
   * @param {number} communityData.longitude - Location longitude
   * @param {string} communityData.city - City name
   * @param {string} communityData.state - State name
   * @param {string} communityData.pincode - Pincode
   * @param {string} communityData.address - Full address
   * @param {number} communityData.population - Approximate population
   * @param {File} communityData.coverImage - Cover image file
   * @returns {Promise} Registered community details
   */
  registerCommunity: async (communityData) => {
    try {
      const { coverImage, latitude, longitude, ...fields } = communityData;

      // If a cover image file is provided, upload to S3 first
      let coverImageKey = null;
      if (coverImage instanceof File) {
        const { uploadUrl, key } = await generateUploadUrl(
          coverImage.type,
          coverImage.name,
          'community-covers'
        );
        await uploadfileToS3(coverImage, uploadUrl);
        coverImageKey = key;
      }

      // Transform latitude/longitude to backend location format [lng, lat]
      const location = {
        type: 'Point',
        coordinates: [parseFloat(longitude), parseFloat(latitude)]
      };

      const response = await apiClient.post('/community', {
        ...fields,
        location,
        ...(coverImageKey ? { coverImageKey } : {}),
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Update community details (Community Leader only)
   * @param {string} communityId - Community ID
   * @param {Object} updateData - Data to update
   * @returns {Promise} Updated community details
   */
  updateCommunity: async (communityId, updateData) => {
    try {
      const { coverImage, ...fields } = updateData;

      let coverImageKey = null;
      if (coverImage instanceof File) {
        const { uploadUrl, key } = await generateUploadUrl(
          coverImage.type,
          coverImage.name,
          'community-covers'
        );
        await uploadfileToS3(coverImage, uploadUrl);
        coverImageKey = key;
      }

      const response = await apiClient.put(`/community/${communityId}`, {
        ...fields,
        ...(coverImageKey ? { coverImageKey } : {}),
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // ==================== COMMUNITY ACTIVITIES ENDPOINTS ====================

  /**
   * Get all activities for a community
   * @param {string} communityId - Community ID
   * @param {Object} params - Query parameters (page, limit, status)
   * @returns {Promise} List of activities
   */
  getActivities: async (communityId, params = {}) => {
    try {
      const response = await apiClient.get(`/community/${communityId}/activities`, { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Create new community activity (Community Leader only)
   * @param {string} communityId - Community ID
   * @param {Object} activityData - Activity data
   * @param {string} activityData.title - Activity title
   * @param {string} activityData.description - Activity description
   * @param {Date} activityData.date - Activity date
   * @param {string} activityData.location - Activity location
   * @param {string} activityData.type - Activity type (e.g., "meeting", "cleanup", "event")
   * @returns {Promise} Created activity details
   */
  createActivity: async (communityId, activityData) => {
    try {
      const response = await apiClient.post(`/community/${communityId}/activities`, activityData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  getActivityById: async (activityId) => {
    try {
      const response = await apiClient.get(`/community/activities/${activityId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  getAllActivitiesForCommunity: async (communityId, params = {}) => {
    try {
      const response = await apiClient.get(`/community/${communityId}/activities/all`, { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  updateActivity: async (activityId, updateData) => {
    try {
      const response = await apiClient.put(`/community/activities/${activityId}`, updateData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  completeActivity: async (activityId, data) => {
    try {
      const response = await apiClient.put(`/community/activities/${activityId}/complete`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  deleteActivity: async (activityId) => {
    try {
      const response = await apiClient.delete(`/community/activities/${activityId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  getMyActivities: async (params = {}) => {
    try {
      const response = await apiClient.get('/community/my/activities', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // NOTE: Community Responsibilities follow a "take responsibility" model, not CRUD
  // Users apply to take responsibility of a community, admin approves/rejects
  // Only takeResponsibility, getMyResponsibilities, and submitCompletionReport are implemented in backend

  /**
   * Get community leader statistics
   * @param {string} communityId - Community ID
   * @returns {Promise} Statistics object with counts and metrics
   */
  getCommunityStats: async (communityId) => {
    try {
      const response = await apiClient.get(`/community/${communityId}/stats`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // ==================== RESPONSIBILITY ENDPOINTS ====================

  /**
   * Apply to take responsibility of a community
   * @param {string} communityId - Community ID
   * @param {Object} data - { role, responsibilities[], motivation }
   * @returns {Promise} Created responsibility record
   */
  takeResponsibility: async (communityId, data) => {
    try {
      const response = await apiClient.post(`/community/${communityId}/responsibility`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Get the logged-in user's own responsibility records across all communities
   * @returns {Promise} List of responsibility records
   */
  getMyResponsibilities: async () => {
    try {
      const response = await apiClient.get('/community/my/responsibilities');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Submit a completion report for an active responsibility
   * @param {string} responsibilityId - Responsibility ID
   * @param {string} completionReport - Report text
   * @returns {Promise} Updated responsibility record
   */
  submitCompletionReport: async (responsibilityId, completionReport) => {
    try {
      const response = await apiClient.put(`/community/responsibilities/${responsibilityId}/report`, { completionReport });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};

export default communityService;
