import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("client_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("client_token");
      localStorage.removeItem("client_user");
      // Only redirect if not already on login page
      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;

// ─── Auth ────────────────────────────────────────────────────────────
export const authAPI = {
  register: (data: { firstName: string; lastName: string; email: string; password: string; cabinet?: string; phone?: string }) =>
    api.post("/clients/register", data),
  login: (data: { email: string; password: string }) =>
    api.post("/clients/login", data),
  logout: () => api.get("/clients/logout"),
  getMe: () => api.get("/clients/me"),
  updateProfile: (data: any) => api.put("/clients/profile", data),
};

// ─── Products ────────────────────────────────────────────────────────
export const productsAPI = {
  getAll: (params?: { search?: string; category?: string; brand?: string; featured?: boolean; page?: number; limit?: number }) =>
    api.get("/products/client", { params }),
  getById: (id: string) => api.get(`/products/${id}`),
  getFeatured: () => api.get("/products/client", { params: { featured: true } }),
};

// ─── Categories ──────────────────────────────────────────────────────
export const categoriesAPI = {
  getAll: () => api.get("/categories"),
};

// ─── Cart & Orders ───────────────────────────────────────────────────
export const ordersAPI = {
  create: (data: any) => api.post("/orders/new", data),
  getMyOrders: () => api.get("/orders/my-orders"),
  getById: (id: string) => api.get(`/orders/${id}`),
};

// ─── Reviews ─────────────────────────────────────────────────────────
export const reviewsAPI = {
  create: (data: { productId: string; rating: number; comment: string }) =>
    api.post("/products/client/reviews", data),
  getPlatformReviews: () => api.get("/platform-reviews"),
};

// ─── Promotions ──────────────────────────────────────────────────────
export const promotionsAPI = {
  getActive: () => api.get("/promotions/active"),
};

// ─── Settings ────────────────────────────────────────────────────────
export const settingsAPI = {
  get: () => api.get("/settings"),
};

// ─── Hero Images ─────────────────────────────────────────────────────
export const heroAPI = {
  getActive: () => api.get("/hero-images"),
};
