import axios from 'axios';

const getAuthToken = () => localStorage.getItem('token');
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000') + '/api';

const leaderClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

leaderClient.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

leaderClient.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/auth/login';
    }
    return Promise.reject(err.response?.data || err);
  }
);

const communityLeaderService = {
  // GET /api/community-leader/dashboard
  getDashboard: async () => {
    const r = await leaderClient.get('/community-leader/dashboard');
    return r.data;
  },

  // GET /api/community-leader/community
  getMyCommunity: async () => {
    const r = await leaderClient.get('/community-leader/community');
    return r.data;
  },

  // PUT /api/community-leader/community
  updateMyCommunity: async (data) => {
    const r = await leaderClient.put('/community-leader/community', data);
    return r.data;
  },

  // GET /api/community-leader/members
  getMembers: async (params = {}) => {
    const r = await leaderClient.get('/community-leader/members', { params });
    return r.data;
  },

  // GET /api/community-leader/activities
  getActivities: async (params = {}) => {
    const r = await leaderClient.get('/community-leader/activities', { params });
    return r.data;
  },

  // POST /api/community-leader/activities
  createActivity: async (data) => {
    const r = await leaderClient.post('/community-leader/activities', data);
    return r.data;
  },

  // GET /api/community-leader/activities/:id
  getActivityById: async (id) => {
    const r = await leaderClient.get(`/community-leader/activities/${id}`);
    return r.data;
  },

  // PUT /api/community-leader/activities/:id
  updateActivity: async (id, data) => {
    const r = await leaderClient.put(`/community-leader/activities/${id}`, data);
    return r.data;
  },

  // PUT /api/community-leader/activities/:id/start
  startActivity: async (id) => {
    const r = await leaderClient.put(`/community-leader/activities/${id}/start`);
    return r.data;
  },

  // PUT /api/community-leader/activities/:id/complete
  completeActivity: async (id, data = {}) => {
    const r = await leaderClient.put(`/community-leader/activities/${id}/complete`, data);
    return r.data;
  },

  // DELETE /api/community-leader/activities/:id
  deleteActivity: async (id) => {
    const r = await leaderClient.delete(`/community-leader/activities/${id}`);
    return r.data;
  },
};

export default communityLeaderService;
