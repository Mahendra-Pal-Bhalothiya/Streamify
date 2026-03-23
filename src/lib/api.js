import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5001/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

/* =========================
   REQUEST INTERCEPTOR
========================= */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/* =========================
   RESPONSE INTERCEPTOR
========================= */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
    return Promise.reject(error);
  }
);

/* =========================
   AUTH
========================= */

export const login = async (data) => {
  const res = await api.post("/auth/login", data);

  if (res.data.token) {
    localStorage.setItem("token", res.data.token);
  }

  if (res.data.user) {
    localStorage.setItem("user", JSON.stringify(res.data.user));
  }

  return res.data;
};

export const signup = async (data) => {
  const res = await api.post("/auth/signup", data);

  if (res.data.token) {
    localStorage.setItem("token", res.data.token);
  }

  return res.data;
};

export const logout = async () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  const res = await api.post("/auth/logout");
  return res.data;
};

export const getCurrentUser = async () => {
  const res = await api.get("/auth/me");
  return res.data;
};

/* =========================
   USER PROFILE
========================= */

export const updateUserProfile = async (data) => {
  const res = await api.put("/users/profile", data);
  return res.data;
};

export const completeOnboarding = async (data) => {
  const res = await api.put("/users/onboarding", data);
  return res.data;
};

export const getUserById = async (userId) => {
  const res = await api.get(`/users/${userId}`);
  return res.data;
};

/* =========================
   FRIENDS
========================= */

export const getUserFriends = async () => {
  const res = await api.get("/users/friends");
  return res.data.friends || [];   // normalized
};

export const getRecommendedUsers = async () => {
  const res = await api.get("/users/recommended");
  return res.data.users || [];   // normalized
};

export const getOutgoingFriendReqs = async () => {
  const res = await api.get("/users/outgoing-friend-requests");
  return res.data.requests || [];   // normalized
};

export const getFriendRequests = async () => {
  const res = await api.get("/users/friend-requests");
  return res.data.requests || [];
};

export const sendFriendRequest = async (userId) => {
  const res = await api.post(`/users/friend-request/${userId}`);
  return res.data;
};

export const acceptFriendRequest = async (requestId) => {
  const res = await api.put(
    `/users/friend-request/${requestId}/accept`
  );
  return res.data;
};

/* =========================
   SEARCH
========================= */

export const searchUsers = async (query) => {
  const res = await api.get(`/users/search?q=${query}`);
  return res.data.users || [];
};

/* =========================
   STREAM TOKEN
========================= */

export const getStreamToken = async (userId) => {
  const res = await api.post("/stream/token", { userId });
  return res.data;
};

export default api;