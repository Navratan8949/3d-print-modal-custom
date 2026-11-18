/**
 * Prime 3D Printing Lab - Unified API Client & Axios Interceptor
 * Handles authentication, in-memory tokens, HttpOnly refresh cookies,
 * automatic 401 retry queue, and all domain API endpoints.
 */

import axios from "axios";
import { tokenManager } from "./tokenManager";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

// ==========================================
// AXIOS CORE INSTANCE & INTERCEPTORS
// ==========================================
export const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Transmit HttpOnly cookies across origins
});

// State for concurrent request queuing while refreshing token
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Request Interceptor: Attach in-memory Access Token
axiosClient.interceptors.request.use(
  (config) => {
    const token = tokenManager.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Seamless Auto-Refresh on 401
axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Do not attempt refresh on auth endpoints to prevent infinite loops
    const isAuthEndpoint =
      originalRequest?.url?.includes("/auth/login") ||
      originalRequest?.url?.includes("/auth/register") ||
      originalRequest?.url?.includes("/auth/refresh");

    if (
      error.response?.status === 401 &&
      !originalRequest?._retry &&
      !isAuthEndpoint
    ) {
      if (isRefreshing) {
        // Queue concurrent requests while a refresh is in-flight
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return axiosClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Call backend refresh endpoint with HttpOnly cookie
        const refreshResponse = await axios.post(
          `${API_BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        const newAccessToken =
          refreshResponse.data?.accessToken || refreshResponse.data?.token;

        if (newAccessToken) {
          tokenManager.setAccessToken(newAccessToken);
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

          processQueue(null, newAccessToken);
          return axiosClient(originalRequest);
        } else {
          throw new Error("No access token returned from refresh endpoint");
        }
      } catch (refreshError) {
        processQueue(refreshError, null);
        tokenManager.clearAccessToken();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

/**
 * Universal request wrapper powered by axiosClient
 */
async function request(endpoint, options = {}) {
  const method = (options.method || "GET").toUpperCase();
  const headers = { ...options.headers };

  let data = undefined;
  if (options.body) {
    if (options.body instanceof FormData) {
      data = options.body;
      delete headers["Content-Type"];
    } else if (typeof options.body === "string") {
      try {
        data = JSON.parse(options.body);
      } catch {
        data = options.body;
      }
    } else {
      data = options.body;
    }
  }

  try {
    const response = await axiosClient({
      url: endpoint,
      method,
      headers,
      data,
    });
    return response.data;
  } catch (error) {
    const msg =
      error.response?.data?.message ||
      error.message ||
      `Request failed with status ${error.response?.status || 500}`;
    throw new Error(msg);
  }
}

// ==========================================
// AUTH API
// ==========================================
export const authAPI = {
  login: async (email, password) => {
    return request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },

  register: async ({ name, email, phone, password }) => {
    return request("/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, phone, password }),
    });
  },

  refreshToken: async () => {
    return request("/auth/refresh", { method: "POST" });
  },

  logout: async () => {
    return request("/auth/logout", { method: "POST" });
  },

  getMe: async () => {
    return request("/auth/me", { method: "GET" });
  },

  forgotPassword: async (email) => {
    return request("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  },

  resetPassword: async ({ email, otp, token, newPassword }) => {
    return request("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ email, otp, token, newPassword }),
    });
  },

  updateProfile: async (userData) => {
    let body;
    if (userData instanceof FormData) {
      body = userData;
    } else {
      body = JSON.stringify(userData);
    }
    return request("/auth/update-profile", {
      method: "POST",
      body,
    });
  },

  changePassword: async (currentPassword, newPassword) => {
    return request("/auth/change-password", {
      method: "POST",
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  },
};

// ==========================================
// PRODUCTS API
// ==========================================
export const productsAPI = {
  getAll: async (params = {}) => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") {
        searchParams.append(k, v);
      }
    });
    const qs = searchParams.toString();
    return request(`/products${qs ? `?${qs}` : ""}`, { method: "GET" });
  },

  getBySlugOrId: async (identifier) => {
    return request(`/products/${identifier}`, { method: "GET" });
  },

  getCategories: async () => {
    return request("/products/categories", { method: "GET" });
  },

  create: async (productData) => {
    let body;
    if (productData instanceof FormData) {
      body = productData;
    } else {
      body = JSON.stringify(productData);
    }
    return request("/products", {
      method: "POST",
      body,
    });
  },

  update: async (id, productData) => {
    let body;
    if (productData instanceof FormData) {
      body = productData;
    } else {
      body = JSON.stringify(productData);
    }
    return request(`/products/${id}`, {
      method: "PUT",
      body,
    });
  },

  delete: async (id) => {
    return request(`/products/${id}`, { method: "DELETE" });
  },

  toggleFeatured: async (id) => {
    return request(`/products/${id}/toggle-featured`, { method: "PATCH" });
  },

  toggleSlider: async (id) => {
    return request(`/products/${id}/toggle-slider`, { method: "PATCH" });
  },

  deleteImage: async (id, imageUrl) => {
    return request(`/products/${id}/images`, {
      method: "DELETE",
      body: JSON.stringify({ imageUrl }),
    });
  },

  setPrimaryImage: async (id, imageUrl) => {
    return request(`/products/${id}/primary-image`, {
      method: "PATCH",
      body: JSON.stringify({ imageUrl }),
    });
  },
};

// ==========================================
// ORDERS API
// ==========================================
export const ordersAPI = {
  create: async (orderData) => {
    let body;
    if (orderData instanceof FormData) {
      body = orderData;
    } else {
      body = JSON.stringify(orderData);
    }
    return request("/orders", {
      method: "POST",
      body,
    });
  },

  getMyOrders: async () => {
    return request("/orders/my-orders", { method: "GET" });
  },

  getById: async (id) => {
    return request(`/orders/${id}`, { method: "GET" });
  },

  getAllAdmin: async (params = {}) => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") {
        searchParams.append(k, v);
      }
    });
    const qs = searchParams.toString();
    return request(`/orders/admin/all${qs ? `?${qs}` : ""}`, { method: "GET" });
  },

  updateStatus: async (id, updateData) => {
    return request(`/orders/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify(updateData),
    });
  },

  updatePhotos: async (id, formData) => {
    return request(`/orders/${id}/photos`, {
      method: "PATCH",
      body: formData,
    });
  },

  delete: async (id) => {
    return request(`/orders/${id}`, { method: "DELETE" });
  },
};

// ==========================================
// CONTACT / INQUIRIES API
// ==========================================
export const contactAPI = {
  submit: async (data) => {
    return request("/contact", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  getAllAdmin: async (params = {}) => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") {
        searchParams.append(k, v);
      }
    });
    const qs = searchParams.toString();
    return request(`/contact/admin/all${qs ? `?${qs}` : ""}`, { method: "GET" });
  },

  updateStatus: async (id, data) => {
    return request(`/contact/admin/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  delete: async (id) => {
    return request(`/contact/admin/${id}`, { method: "DELETE" });
  },
};

export const inquiriesAPI = contactAPI;

// ==========================================
// CATEGORIES API
// ==========================================
export const categoriesAPI = {
  getAll: async () => {
    return request("/categories", { method: "GET" });
  },

  getAllAdmin: async () => {
    return request("/categories/admin/all", { method: "GET" });
  },

  create: async (categoryData) => {
    return request("/categories", {
      method: "POST",
      body: JSON.stringify(categoryData),
    });
  },

  update: async (id, categoryData) => {
    return request(`/categories/${id}`, {
      method: "PUT",
      body: JSON.stringify(categoryData),
    });
  },

  delete: async (id) => {
    return request(`/categories/${id}`, { method: "DELETE" });
  },
};

// ==========================================
// DASHBOARD API
// ==========================================
export const dashboardAPI = {
  getStats: async () => {
    return request("/dashboard/stats", { method: "GET" });
  },
};

// ==========================================
// PAYMENT API (RAZORPAY)
// ==========================================
export const paymentAPI = {
  createOrder: async (orderData) => {
    return request("/payment/create-order", {
      method: "POST",
      body: JSON.stringify(orderData),
    });
  },

  verifyPayment: async (paymentData) => {
    return request("/payment/verify", {
      method: "POST",
      body: JSON.stringify(paymentData),
    });
  },

  getKey: async () => {
    return request("/payment/key", { method: "GET" });
  },
};

export default {
  auth: authAPI,
  products: productsAPI,
  orders: ordersAPI,
  payment: paymentAPI,
  contact: contactAPI,
  categories: categoriesAPI,
  inquiries: inquiriesAPI,
  dashboard: dashboardAPI,
};
