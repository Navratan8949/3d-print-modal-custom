/**
 * Prime 3D Printing Lab - API Client
 * Connects frontend with Express/Node.js backend
 */

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

const getAuthToken = () => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("prime3d_token");
};

/**
 * Universal request wrapper with authorization & JSON handling
 */
async function request(endpoint, options = {}) {
  const token = getAuthToken();
  const headers = {
    ...options.headers,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // If not FormData, send as application/json
  if (!(options.body instanceof FormData) && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  const url = `${API_BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.message || `Request failed with status ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error.message);
    throw error;
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

  delete: async (id) => {
    return request(`/orders/${id}`, { method: "DELETE" });
  },
};

// ==========================================
// CONTACT API
// ==========================================
export const contactAPI = {
  submit: async (data) => {
    return request("/contact", {
      method: "POST",
      body: JSON.stringify(data),
    });
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

export default {
  auth: authAPI,
  products: productsAPI,
  orders: ordersAPI,
  contact: contactAPI,
  dashboard: dashboardAPI,
};

