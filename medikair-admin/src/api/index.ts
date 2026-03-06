import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("admin_token");
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
      localStorage.removeItem("admin_token");
      localStorage.removeItem("admin_user");
      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;

// ─── Admin Auth ──────────────────────────────────────────────────────
export const adminAuthAPI = {
  login: (data: { email: string; password: string }) =>
    api.post("/admin/login", data),
  logout: () => api.get("/admin/logout"),
  getMe: () => api.get("/admin/me"),
  getAll: () => api.get("/admin/users"),
  register: (data: { name: string; email: string; password: string; privilege?: string }) =>
    api.post("/admin/register", data),
  updatePrivilege: (id: string, privilege: string) =>
    api.put(`/admin/users/${id}`, { privilege }),
  delete: (id: string) => api.delete(`/admin/users/${id}`),
};

// ─── Products ────────────────────────────────────────────────────────
export const productsAPI = {
  getAll: (params?: any) => api.get("/products", { params }),
  getById: (id: string) => api.get(`/products/${id}`),
  create: (data: any) => api.post("/admin/product/new", data),
  update: (id: string, data: any) => api.put(`/admin/product/${id}`, data),
  delete: (id: string) => api.delete(`/admin/product/${id}`),
};

// ─── Categories ──────────────────────────────────────────────────────
export const categoriesAPI = {
  getAll: (params?: any) => api.get("/categories", { params }),
  getTree: () => api.get("/categories/tree"),
  create: (data: any) => api.post("/categories/admin", data),
  update: (id: string, data: any) => api.put(`/categories/admin/${id}`, data),
  delete: (id: string) => api.delete(`/categories/admin/${id}`),
};

// ─── Orders ──────────────────────────────────────────────────────────
export const ordersAPI = {
  getAll: (params?: any) => api.get("/admin/orders", { params }),
  getById: (id: string) => api.get(`/orders/${id}`),
  updateStatus: (id: string, status: string) => api.put(`/admin/order/${id}`, { status }),
  delete: (id: string) => api.delete(`/admin/order/${id}`),
  validate: (id: string, action: string) => api.put(`/orders/${id}/validate`, { action }),
};

// ─── Clients ─────────────────────────────────────────────────────────
export const clientsAPI = {
  getAll: (params?: any) => api.get("/admin/clients", { params }),
  getById: (id: string) => api.get(`/admin/clients/${id}`),
  delete: (id: string) => api.delete(`/admin/clients/${id}`),
};

// ─── Promotions ──────────────────────────────────────────────────────
export const promotionsAPI = {
  getAll: () => api.get("/promotions"),
  create: (data: any) => api.post("/promotions", data),
  update: (id: string, data: any) => api.put(`/promotions/${id}`, data),
  delete: (id: string) => api.delete(`/promotions/${id}`),
  toggle: (id: string) => api.put(`/promotions/${id}/toggle`),
};

// ─── Upload ──────────────────────────────────────────────────────────
export const uploadAPI = {
  uploadImage: (formData: FormData) =>
    api.post("/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),  uploadImageBase64: (base64: string) =>
    api.post("/upload", { image: base64 }),
  uploadDocument: (base64: string, fileName?: string) =>
    api.post("/upload/document", { document: base64, fileName }),  deleteImage: (publicId: string) =>
    api.delete("/upload", { data: { public_id: publicId } }),
};

// ─── Hero Images ─────────────────────────────────────────────────────
export const heroAPI = {
  getAll: () => api.get("/hero-images/admin"),
  create: (data: any) => api.post("/hero-images/admin", data),
  update: (id: string, data: any) => api.put(`/hero-images/admin/${id}`, data),
  delete: (id: string) => api.delete(`/hero-images/admin/${id}`),
  reorder: (orderedIds: string[]) => api.put("/hero-images/admin/reorder", { orderedIds }),
};

// ─── Settings ────────────────────────────────────────────────────────
export const settingsAPI = {
  get: () => api.get("/settings"),
  update: (data: any) => api.put("/settings", data),
};

// ─── Reports / Analytics ─────────────────────────────────────────────
export const reportsAPI = {
  getDashboard: () => api.get("/reports/dashboard"),
  getRevenue: (params?: any) => api.get("/reports/revenue", { params }),
  getTopProducts: (params?: any) => api.get("/reports/top-products", { params }),
  getCategoryStats: () => api.get("/reports/categories"),
  getClientSegments: () => api.get("/reports/client-segments"),
  getOrderTrends: (params?: any) => api.get("/reports/order-trends", { params }),
  getAIMetrics: () => api.get("/reports/ai-metrics"),
};
