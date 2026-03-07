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
  register: (data: { name: string; email: string; password: string; cabinet?: string; phone?: string }) =>
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
  reorder: (orderId: string) => api.post(`/orders/reorder/${orderId}`),
  validate: (orderId: string, action: "approve" | "reject") =>
    api.put(`/orders/${orderId}/validate`, { action }),
  importCSV: (csvData: string) =>
    api.post("/orders/client-import-csv", { csvData }),
};

// ─── Server-side Cart ────────────────────────────────────────────────
export const cartAPI = {
  get: () => api.get("/cart"),
  add: (productId: string, quantity: number, variation?: string) =>
    api.post("/cart/add", { productId, quantity, variation }),
  updateItem: (itemId: string, quantity: number) =>
    api.put(`/cart/${itemId}`, { quantity }),
  removeItem: (itemId: string) => api.delete(`/cart/${itemId}`),
  clear: () => api.delete("/cart"),
  sync: (items: Array<{ productId: string; quantity: number; variation?: string }>) =>
    api.post("/cart/sync", { items }),
};

// ─── Reviews ─────────────────────────────────────────────────────────
export const reviewsAPI = {
  create: (data: { productId: string; rating: number; comment: string; name: string; email: string }) =>
    api.post("/products/client/reviews", data),
  getForProduct: (productId: string) => api.get(`/products/client/reviews/${productId}`),
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

// ─── Notifications ───────────────────────────────────────────────────
export const notificationsAPI = {
  getAll: (params?: { page?: number; limit?: number; unread?: boolean }) =>
    api.get("/notifications", { params }),
  markAsRead: (id: string) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put("/notifications/read-all"),
  delete: (id: string) => api.delete(`/notifications/${id}`),
};

// ─── Favorites ───────────────────────────────────────────────────────
export const favoritesAPI = {
  get: () => api.get("/clients/favorites"),
  toggle: (productId: string) => api.put(`/clients/favorites/${productId}`),
};

// ─── Notification Preferences ────────────────────────────────────────
export const notifPrefsAPI = {
  update: (data: { email?: boolean; stock?: boolean; promotions?: boolean; newsletter?: boolean }) =>
    api.put("/clients/notifications", data),
};

// ─── Search (Meilisearch) ────────────────────────────────────────────
export interface SearchParams {
  q?: string;
  brand?: string;
  category?: string;
  subcategory?: string;
  famille?: string;
  priceMin?: number;
  priceMax?: number;
  inStock?: boolean;
  isOffer?: boolean;
  productType?: string;
  sort?: string;
  page?: number;
  limit?: number;
}

export const searchAPI = {
  search: (params: SearchParams) =>
    api.get("/search", { params }),
  suggest: (q: string) =>
    api.get("/search/suggest", { params: { q } }),
  facets: () =>
    api.get("/search/facets"),
};

// ─── AI Recommendations ──────────────────────────────────────────────
export const aiAPI = {
  getSimilar: (productId: string, limit = 6) =>
    api.get(`/ai/similar/${productId}`, { params: { limit } }),
  getPersonal: (clientId: string, limit = 8) =>
    api.get(`/ai/personal/${clientId}`, { params: { limit } }),
  getHybrid: (clientId: string, productId?: string, limit = 8) =>
    api.get(`/ai/hybrid/${clientId}`, { params: { product_id: productId, limit } }),
  getCrossSell: (productIds: string[], limit = 4) =>
    api.post("/ai/cross-sell", { product_ids: productIds }, { params: { limit } }),
  getUpSell: (productId: string, limit = 3) =>
    api.get(`/ai/up-sell/${productId}`, { params: { limit } }),
  health: () =>
    api.get("/ai/health"),
};
