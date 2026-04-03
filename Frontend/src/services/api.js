// public apis

import axios from "axios";

const base = import.meta.env.PROD
  ? String(import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "")
  : "";

export const fetchedPublicData = async () => {
  const response = await axios.get(`${base}/api/public/stats`);
  return response.data;
};

export const fetchPublicNgos = async (limit = 4, page = 1) => {
  const response = await axios.get(`${base}/api/ngo`, { params: { limit, page } });
  return response.data;
};
