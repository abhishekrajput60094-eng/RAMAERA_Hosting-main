import { create } from "zustand";
import api from "../api/axiosInstance";

// ============================================================
// 🧩 Interfaces
// ============================================================

// User model matching FastAPI schema
export interface User {
  id: number;
  email: string;
  full_name: string;
  role: string;
  account_status: string;
  phone?: string | null;
  company?: string | null;
  referral_code?: string | null;
  referred_by?: number | null;
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

interface UserStore {
  users: User[];
  user: User | null;
  stats: UserStats | null;
  loading: boolean;
  error: string | null;

  // Actions
  fetchUsers: (filters?: {
    search?: string;
    role?: string;
    status?: string;
  }) => Promise<void>;
  getUserById: (id: number) => Promise<void>;
  createUser: (data: UserCreate) => Promise<void>;
  updateUser: (id: number, data: UserUpdate) => Promise<void>;
  deleteUser: (id: number) => Promise<void>;
  suspendUser: (id: number) => Promise<void>;
  activateUser: (id: number) => Promise<void>;
  fetchUserStats: () => Promise<void>;
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
