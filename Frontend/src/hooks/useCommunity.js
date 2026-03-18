import { useState, useCallback } from 'react';
import communityService from '../services/communityService';

/**
 * Custom hook for managing community feature
 * Handles fetching, searching, and caching of community data
 */
export const useCommunity = () => {
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedCommunity, setSelectedCommunity] = useState(null);

  // Fetch all communities
  const fetchCommunities = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      const response = await communityService.getAllCommunities(params);
      // Backend returns { data: { communities: [...], pagination: {...} } }
      const list = response?.data?.communities ?? response?.communities ?? response?.data ?? [];
      setCommunities(Array.isArray(list) ? list : []);
    } catch (err) {
      setError(err.message || 'Failed to fetch communities');
    } finally {
      setLoading(false);
    }
  }, []);

  // Search communities — returns raw response so callers can read pagination
  const searchCommunities = useCallback(async (searchParams = {}) => {
    try {
      setLoading(true);
      setError(null);
      const response = await communityService.searchCommunities(searchParams);
      const list = response?.data?.communities ?? response?.communities ?? response?.data ?? [];
      setCommunities(Array.isArray(list) ? list : []);
      return response; // caller needs pagination info
    } catch (err) {
      setError(err.message || 'Failed to search communities');
    } finally {
      setLoading(false);
    }
  }, []);

  // Get community by ID
  const getCommunity = useCallback(async (communityId) => {
    try {
      setLoading(true);
      setError(null);
      const response = await communityService.getCommunityById(communityId);
      // Backend returns { data: { community: {...} } }
      const communityData = response?.data?.community ?? response?.community ?? response?.data ?? response;
      setSelectedCommunity(communityData);
      return communityData;
    } catch (err) {
      setError(err.message || 'Failed to fetch community');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Register new community
  const registerCommunity = useCallback(async (communityData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await communityService.registerCommunity(communityData);
      // Backend returns { data: { community: {...} } }
      const newCommunity = response?.data?.community ?? response?.community ?? response?.data ?? response;
      setCommunities([...communities, newCommunity]);
      return newCommunity;
    } catch (err) {
      setError(err.message || 'Failed to register community');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [communities]);

  // Update community
  const updateCommunity = useCallback(async (communityId, updateData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await communityService.updateCommunity(communityId, updateData);
      const updatedCommunity = response.data || response;
      
      // Update in list
      setCommunities(communities.map(c => c._id === communityId ? updatedCommunity : c));
      
      // Update selected if applicable
      if (selectedCommunity?._id === communityId) {
        setSelectedCommunity(updatedCommunity);
      }
      
      return updatedCommunity;
    } catch (err) {
      setError(err.message || 'Failed to update community');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [communities, selectedCommunity]);

  return {
    communities,
    selectedCommunity,
    loading,
    error,
    fetchCommunities,
    searchCommunities,
    getCommunity,
    registerCommunity,
    updateCommunity,
    setError,
  };
};

/**
 * Custom hook for taking / viewing the current user's own responsibilities
 */
export const useMyResponsibilities = () => {
  const [responsibilities, setResponsibilities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchMyResponsibilities = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await communityService.getMyResponsibilities();
      const list = response?.data?.responsibilities ?? response?.responsibilities ?? [];
      setResponsibilities(Array.isArray(list) ? list : []);
    } catch (err) {
      setError(err.message || 'Failed to fetch your responsibilities');
    } finally {
      setLoading(false);
    }
  }, []);

  const applyResponsibility = useCallback(async (communityId, data) => {
    try {
      setLoading(true);
      setError(null);
      const response = await communityService.takeResponsibility(communityId, data);
      const record = response?.data?.responsibility ?? response?.responsibility ?? response?.data ?? response;
      setResponsibilities(prev => [record, ...prev]);
      return record;
    } catch (err) {
      setError(err.message || 'Failed to submit responsibility application');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const submitReport = useCallback(async (responsibilityId, completionReport) => {
    try {
      setLoading(true);
      setError(null);
      const response = await communityService.submitCompletionReport(responsibilityId, completionReport);
      const updated = response?.data?.responsibility ?? response?.responsibility ?? response?.data ?? response;
      setResponsibilities(prev => prev.map(r => r._id === responsibilityId ? updated : r));
      return updated;
    } catch (err) {
      setError(err.message || 'Failed to submit completion report');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    responsibilities,
    loading,
    error,
    fetchMyResponsibilities,
    applyResponsibility,
    submitReport,
    setError,
  };
};

/**
 * Custom hook for managing community activities
 */
export const useActivity = (communityId) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedActivity, setSelectedActivity] = useState(null);

  // Fetch public verified activities (used in CommunityDetail public view)
  const fetchActivities = useCallback(async (params = {}) => {
    if (!communityId) return;
    try {
      setLoading(true);
      setError(null);
      const response = await communityService.getActivities(communityId, params);
      const list = response?.data?.activities ?? response?.activities ?? response?.data ?? [];
      setActivities(Array.isArray(list) ? list : []);
    } catch (err) {
      setError(err.message || 'Failed to fetch activities');
    } finally {
      setLoading(false);
    }
  }, [communityId]);

  // Fetch all activities for a community (any status — for member/leader view)
  const fetchAllActivities = useCallback(async (params = {}) => {
    if (!communityId) return;
    try {
      setLoading(true);
      setError(null);
      const response = await communityService.getAllActivitiesForCommunity(communityId, params);
      const list = response?.data?.activities ?? response?.activities ?? response?.data ?? [];
      setActivities(Array.isArray(list) ? list : []);
      return response;
    } catch (err) {
      setError(err.message || 'Failed to fetch activities');
    } finally {
      setLoading(false);
    }
  }, [communityId]);

  // Get activity details
  const getActivity = useCallback(async (activityId) => {
    try {
      setLoading(true);
      setError(null);
      const response = await communityService.getActivityById(activityId);
      const activityData = response?.data?.activity ?? response?.activity ?? response?.data ?? response;
      setSelectedActivity(activityData);
      return activityData;
    } catch (err) {
      setError(err.message || 'Failed to fetch activity');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Create activity
  const createActivity = useCallback(async (activityData) => {
    if (!communityId) throw new Error('Community ID required');
    try {
      setLoading(true);
      setError(null);
      const response = await communityService.createActivity(communityId, activityData);
      const newActivity = response?.data?.activity ?? response?.activity ?? response?.data ?? response;
      setActivities(prev => [newActivity, ...prev]);
      return newActivity;
    } catch (err) {
      setError(err.message || 'Failed to create activity');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [communityId]);

  // Update activity
  const updateActivity = useCallback(async (activityId, updateData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await communityService.updateActivity(activityId, updateData);
      const updatedActivity = response.data || response;
      
      setActivities(activities.map(a => a._id === activityId ? updatedActivity : a));
      if (selectedActivity?._id === activityId) {
        setSelectedActivity(updatedActivity);
      }
      
      return updatedActivity;
    } catch (err) {
      setError(err.message || 'Failed to update activity');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [activities, selectedActivity]);

  // Delete activity
  const deleteActivity = useCallback(async (activityId) => {
    try {
      setLoading(true);
      setError(null);
      await communityService.deleteActivity(activityId);
      setActivities(activities.filter(a => a._id !== activityId));
      return true;
    } catch (err) {
      setError(err.message || 'Failed to delete activity');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [activities]);

  // Complete activity
  const completeActivity = useCallback(async (activityId, data) => {
    try {
      setLoading(true);
      setError(null);
      // Ensure we send all required/optional fields for completion
      const completionData = {
        completionNote: data?.completionNote || '',
        beneficiariesCount: parseInt(data?.beneficiariesCount) || 0,
        volunteersCount: parseInt(data?.volunteersCount) || 0,
      };
      const response = await communityService.completeActivity(activityId, completionData);
      const updatedActivity = response?.data?.activity ?? response?.activity ?? response?.data ?? response;
      setActivities(prev => prev.map(a => a._id === activityId ? updatedActivity : a));
      if (selectedActivity?._id === activityId) {
        setSelectedActivity(updatedActivity);
      }
      return updatedActivity;
    } catch (err) {
      setError(err.message || 'Failed to complete activity');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [selectedActivity]);

  return {
    activities,
    selectedActivity,
    loading,
    error,
    fetchActivities,
    fetchAllActivities,
    getActivity,
    createActivity,
    updateActivity,
    deleteActivity,
    completeActivity,
    setError,
  };
};

/**
 * Custom hook for managing community responsibilities
 * Models the "take responsibility" workflow: request → pending → active → completed/revoked
 */
export const useResponsibility = (communityId) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  return {
    loading,
    error,
    setError,
  };
};

/**
 * Custom hook for location management with geo-location
 */
export const useLocation = () => {
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Get user's current location
  const getCurrentLocation = useCallback(() => {
    setLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude);
        setLongitude(position.coords.longitude);
        setLoading(false);
      },
      (err) => {
        setError(err.message || 'Failed to get location');
        setLoading(false);
      }
    );
  }, []);

  // Set manual location
  const setManualLocation = useCallback((lat, lng) => {
    setLatitude(lat);
    setLongitude(lng);
  }, []);

  return {
    latitude,
    longitude,
    loading,
    error,
    getCurrentLocation,
    setManualLocation,
  };
};
