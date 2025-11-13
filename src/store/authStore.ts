import { create } from "zustand";
import api from "../api/axiosInstance";
import { UserRole, AccountStatus } from "../types";

// ============================================================
// 🧩 Interfaces
// ============================================================

// User model matching FastAPI schema
export interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  account_status: AccountStatus;
  phone?: string | null;
  company_name?: string | null;
  address?: string;
  city?: string;
  country?: string;
  referral_code?: string | null;
  referred_by?: string | null; // Changed to string to match id type
  subscription_status?: string;
  created_at?: string;
  updated_at?: string;
}

// Create & Update schema (same as your FastAPI pydantic)
export interface UserCreate {
  email: string;
  full_name: string;
  password: string;
  role?: string;
  account_status?: string;
  phone?: string;
  company?: string;
  referral_code?: string | null;
}

export interface UserUpdate {
  full_name?: string;
  email?: string;
  role?: string;
  account_status?: string;
  phone?: string;
  company?: string;
}

// Stats response model
export interface UserStats {
  total_users: number;
  active_users: number;
  suspended_users: number;
  new_users_today: number;
  new_users_this_week: number;
  new_users_this_month: number;
}

// ============================================================
// 🧠 Zustand Store Interface
// ============================================================

// Login credentials interface
export interface LoginCredentials {
  email: string;
  password: string;
}

// Auth response interface (assuming API returns token and user info)
export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

interface UserStore {
  users: User[];
  user: User | null;
  stats: UserStats | null;
  loading: boolean;
  error: string | null;
  token: string | null;
  isAuthenticated: boolean;

  // Actions
  fetchUsers: (filters?: {
    search?: string;
    role?: string;
    status?: string;
  }) => Promise<void>;
  getUserById: (id: string) => Promise<void>; // Changed id type to string
  createUser: (data: UserCreate) => Promise<void>;
  updateUser: (id: string, data: UserUpdate) => Promise<void>; // Changed id type to string
  deleteUser: (id: string) => Promise<void>; // Changed id type to string
  suspendUser: (id: string) => Promise<void>; // Changed id type to string
  activateUser: (id: string) => Promise<void>; // Changed id type to string
  fetchUserStats: () => Promise<void>;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  checkAuth: () => void;
  signUp: (email: string, password: string, fullName: string, referralCode?: string) => Promise<void>;
  getIsAdmin: () => boolean;
  getIsSuperAdmin: () => boolean;
}

// ============================================================
// 🏗️ Zustand Store Implementation
// ============================================================

export const useUserStore = create<UserStore>((set, get) => ({
  users: [],
  user: null,
  stats: null,
  loading: false,
  error: null,
  token: localStorage.getItem("authToken") || null,
  isAuthenticated: !!localStorage.getItem("authToken"),

  // ============================================================
  // AUTHENTICATION ACTIONS
  // ============================================================

  login: async (credentials) => {
    set({ loading: true, error: null });
    try {
      const res = await api.post<AuthResponse>("/auth/login", credentials);
      const { access_token, user } = res.data;
      localStorage.setItem("authToken", access_token);
      set({ user, token: access_token, isAuthenticated: true, loading: false });
      // Set the Authorization header for future requests
      api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
    } catch (err: any) {
      set({ error: err.message, loading: false });
      throw err; // Re-throw to allow components to catch login errors
    }
  },

  signUp: async (email, password, fullName, referralCode) => {
    set({ loading: true, error: null });
    try {
        const payload = { email, password, full_name: fullName, referral_code: referralCode };
        const res = await api.post<AuthResponse>("/auth/register", payload);
        const { access_token, user } = res.data;
        localStorage.setItem("authToken", access_token);
        set({ user, token: access_token, isAuthenticated: true, loading: false });
        api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
    } catch (err: any) {
        set({ error: err.message, loading: false });
        throw err;
    }
  },

  logout: () => {
    localStorage.removeItem("authToken");
    set({ user: null, token: null, isAuthenticated: false, users: [], stats: null });
    // Remove the Authorization header
    delete api.defaults.headers.common['Authorization'];
  },

  checkAuth: async () => {
    const token = localStorage.getItem("authToken");
    if (token) {
      set({ loading: true });
      try {
        // Verify token and fetch user data if token is valid
        // Assuming there's an endpoint like /auth/me to get current user
        const res = await api.get<User>("/auth/me", {
          headers: { Authorization: `Bearer ${token}` }
        });
        set({ user: res.data, token, isAuthenticated: true, loading: false });
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      } catch (err) {
        console.error("Auth check failed:", err);
        localStorage.removeItem("authToken");
        set({ user: null, token: null, isAuthenticated: false, loading: false });
        delete api.defaults.headers.common['Authorization'];
      }
    } else {
      set({ isAuthenticated: false, loading: false });
    }
  },

  getIsAdmin: () => get().user?.role === 'admin' || get().user?.role === 'super_admin',
  getIsSuperAdmin: () => get().user?.role === 'super_admin',

  // ============================================================
  // FETCH USERS (GET /users)
  // ============================================================
  fetchUsers: async (filters = {}) => {
    set({ loading: true, error: null });
    try {
      const params = new URLSearchParams();
      if (filters.search) params.append("search", filters.search);
      if (filters.role) params.append("role", filters.role);
      if (filters.status) params.append("status", filters.status);

      const res = await api.get<User[]>(`/users?${params.toString()}`);
      set({ users: res.data, loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  // ============================================================
  // GET USER BY ID (GET /users/{id})
  // ============================================================
  getUserById: async (id) => {
    set({ loading: true, error: null });
    try {
      const res = await api.get<User>(`/users/${id}`);
      set({ user: res.data, loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  // ============================================================
  // CREATE USER (POST /users)
  // ============================================================
  createUser: async (data) => {
    set({ loading: true, error: null });
    try {
      const res = await api.post<User>("/users", data);
      set({ users: [...get().users, res.data], loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  // ============================================================
  // UPDATE USER (PUT /users/{id})
  // ============================================================
  updateUser: async (id, data) => {
    set({ loading: true, error: null });
    try {
      const res = await api.put<User>(`/users/${id}`, data);
      set({
        users: get().users.map((u) => (u.id === id ? res.data : u)),
        user: res.data,
        loading: false,
      });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  // ============================================================
  // DELETE USER (DELETE /users/{id})
  // ============================================================
  deleteUser: async (id) => {
    set({ loading: true, error: null });
    try {
      await api.delete(`/users/${id}`);
      set({
        users: get().users.filter((u) => u.id !== id),
        loading: false,
      });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  // ============================================================
  // SUSPEND USER (POST /users/{id}/suspend)
  // ============================================================
  suspendUser: async (id) => {
    set({ loading: true, error: null });
    try {
      await api.post(`/users/${id}/suspend`);
      set({
        users: get().users.map((u) =>
          u.id === id ? { ...u, account_status: "suspended" } : u
        ),
        loading: false,
      });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  // ============================================================
  // ACTIVATE USER (POST /users/{id}/activate)
  // ============================================================
  activateUser: async (id) => {
    set({ loading: true, error: null });
    try {
      await api.post(`/users/${id}/activate`);
      set({
        users: get().users.map((u) =>
          u.id === id ? { ...u, account_status: "active" } : u
        ),
        loading: false,
      });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  // ============================================================
  // FETCH USER STATS (GET /users/stats)
  // ============================================================
  fetchUserStats: async () => {
    set({ loading: true, error: null });
    try {
      const res = await api.get<UserStats>("/users/stats");
      set({ stats: res.data, loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },
}));
