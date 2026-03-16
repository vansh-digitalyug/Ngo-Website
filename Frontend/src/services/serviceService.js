// services/serviceService.js

import axios from "axios";

const API_BASE_URL = `${String(import.meta.env.VITE_API_BASE_URL || "http://localhost:5000").replace(/\/$/, "")}/api`;

export const fetchServices = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/services`);
    return response.data.data; // Assuming the API response has a 'data' field
  } catch (error) {
    console.error("Error fetching services:", error);
    throw error;
  }
};

export const fetchServiceById = async (id) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/services/${id}`);
    return response.data.data; // Assuming the API response has a 'data' field
  } catch (error) {
    console.error(`Error fetching service with id ${id}:`, error);
    throw error;
  }
};

export const fetchCategories = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/services/categories`);
    return response.data.data; // Assuming the API response has a 'data' field
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw error;
  }
};

export const fetchProgramsByCategory = async (categoryId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/services/categories/${categoryId}/programs`);
    return response.data.data; // Assuming the API response has a 'data' field
  } catch (error) {
    console.error(`Error fetching programs for category ${categoryId}:`, error);
    throw error;
  }
};

export const fetchProgramByTitle = async (title) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/services/programs/by-title/${encodeURIComponent(title)}`);
    return response.data.data;
  } catch (error) {
    console.error(`Error fetching program with title "${title}":`, error);
    throw error;
  }
};

export const fetchProgramByHref = async (href) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/services/programs/by-href`, { params: { href } });
    return response.data.data;
  } catch (error) {
    console.error(`Error fetching program with href "${href}":`, error);
    throw error;
  }
};

export const fetchProgramById = async (programId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/services/programs/${programId}`);
    return response.data.data; // Assuming the API response has a 'data' field
  } catch (error) {
    console.error(`Error fetching program with id ${programId}:`, error);
    throw error;
  }
};

export const searchServices = async (query) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/services/search`, {
      params: { q: query },
    });
    return response.data.data; // Assuming the API response has a 'data' field
  } catch (error) {
    console.error(`Error searching services with query "${query}":`, error);
    throw error;
  }
};

// ─── ADMIN APIs ────────────────────────────────────────────────────────────────

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return { Authorization: `Bearer ${token}` };
};

// CATEGORY
export const createCategory = async (payload) => {
  const response = await axios.post(
    `${API_BASE_URL}/services/admin/categories`,
    payload,
    { headers: getAuthHeaders() }
  );
  return response.data.data;
};

export const updateCategory = async (categoryId, payload) => {
  const response = await axios.put(
    `${API_BASE_URL}/services/admin/categories/${categoryId}`,
    payload,
    { headers: getAuthHeaders() }
  );
  return response.data.data;
};

export const deleteCategory = async (categoryId) => {
  const response = await axios.delete(
    `${API_BASE_URL}/services/admin/categories/${categoryId}`,
    { headers: getAuthHeaders() }
  );
  return response.data;
};

export const hideCategory = async (categoryId) => {
  const response = await axios.put(
    `${API_BASE_URL}/services/admin/categories/${categoryId}/hide`,
    {},
    { headers: getAuthHeaders() }
  );
  return response.data;
};

export const unhideCategory = async (categoryId) => {
  const response = await axios.put(
    `${API_BASE_URL}/services/admin/categories/${categoryId}/unhide`,
    {},
    { headers: getAuthHeaders() }
  );
  return response.data;
};

export const fetchCategoriesAdmin = async (includeHidden = false) => {
  const response = await axios.get(
    `${API_BASE_URL}/services/admin/categories`,
    { headers: getAuthHeaders(), params: includeHidden ? { includeHidden: "true" } : {} }
  );
  return response.data.data;
};

export const fetchProgramsByCategoryAdmin = async (categoryId, includeHidden = false) => {
  const response = await axios.get(
    `${API_BASE_URL}/services/categories/${categoryId}/programs`,
    { params: includeHidden ? { includeHidden: "true" } : {} }
  );
  return response.data.data;
};

// PROGRAM
export const createProgram = async (payload) => {
  const response = await axios.post(
    `${API_BASE_URL}/services/admin/programs`,
    payload,
    { headers: getAuthHeaders() }
  );
  return response.data.data;
};

export const updateProgram = async (programId, payload) => {
  const response = await axios.put(
    `${API_BASE_URL}/services/admin/programs/${programId}`,
    payload,
    { headers: getAuthHeaders() }
  );
  return response.data.data;
};

export const deleteProgram = async (programId) => {
  const response = await axios.delete(
    `${API_BASE_URL}/services/admin/programs/${programId}`,
    { headers: getAuthHeaders() }
  );
  return response.data;
};

export const hideProgram = async (programId) => {
  const response = await axios.put(
    `${API_BASE_URL}/services/admin/programs/${programId}/hide`,
    {},
    { headers: getAuthHeaders() }
  );
  return response.data;
};

export const unhideProgram = async (programId) => {
  const response = await axios.put(
    `${API_BASE_URL}/services/admin/programs/${programId}/unhide`,
    {},
    { headers: getAuthHeaders() }
  );
  return response.data;
};

export const hardDeleteProgram = async (programId) => {
  const response = await axios.delete(
    `${API_BASE_URL}/services/admin/programs/${programId}/hard`,
    { headers: getAuthHeaders() }
  );
  return response.data;
};