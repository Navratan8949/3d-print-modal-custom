import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosClient } from "@/lib/api";
import tokenManager from "@/lib/tokenManager";
import axios from "axios";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

// 1. ASYNC THUNK: Login User
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await axiosClient.post("/auth/login", { email, password });
      const { user, accessToken, token } = response.data;
      const validToken = accessToken || token;

      tokenManager.setAccessToken(validToken);
      return { user, accessToken: validToken };
    } catch (err) {
      const message =
        err.response?.data?.message || err.message || "Login failed";
      return rejectWithValue(message);
    }
  }
);

// 2. ASYNC THUNK: Register User
export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async (userData, { rejectWithValue }) => {
    try {
      const response = await axiosClient.post("/auth/register", userData);
      const { user, accessToken, token } = response.data;
      const validToken = accessToken || token;

      tokenManager.setAccessToken(validToken);
      return { user, accessToken: validToken };
    } catch (err) {
      const message =
        err.response?.data?.message || err.message || "Registration failed";
      return rejectWithValue(message);
    }
  }
);

// 3. ASYNC THUNK: Refresh Session (Silent HttpOnly Cookie Verification)
export const refreshSession = createAsyncThunk(
  "auth/refreshSession",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/auth/refresh`,
        {},
        { withCredentials: true }
      );
      const { user, accessToken, token } = response.data;
      const validToken = accessToken || token;

      tokenManager.setAccessToken(validToken);
      return { user, accessToken: validToken };
    } catch (err) {
      tokenManager.clearAccessToken();
      const message =
        err.response?.data?.message || "No active session found";
      return rejectWithValue(message);
    }
  }
);

// 4. ASYNC THUNK: Logout User
export const logoutUser = createAsyncThunk(
  "auth/logoutUser",
  async (_, { rejectWithValue }) => {
    try {
      await axios.post(
        `${API_BASE_URL}/auth/logout`,
        {},
        { withCredentials: true }
      );
      tokenManager.clearAccessToken();
      return true;
    } catch (err) {
      tokenManager.clearAccessToken();
      return true;
    }
  }
);

// 5. ASYNC THUNK: Fetch Current User Profile
export const fetchCurrentUser = createAsyncThunk(
  "auth/fetchCurrentUser",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosClient.get("/auth/me");
      return response.data.user;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch profile");
    }
  }
);

const initialState = {
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isAdmin: false,
  isLoaded: false,
  status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { user, accessToken } = action.payload || {};
      state.user = user || null;
      state.accessToken = accessToken || null;
      state.isAuthenticated = Boolean(user && accessToken);
      state.isAdmin = Boolean(
        user && (user.role === "admin" || user.role === "super_admin")
      );
      state.error = null;
      if (accessToken) {
        tokenManager.setAccessToken(accessToken);
      }
    },
    clearCredentials: (state) => {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
      state.isAdmin = false;
      state.error = null;
      tokenManager.clearAccessToken();
    },
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAdmin = Boolean(
        action.payload &&
          (action.payload.role === "admin" || action.payload.role === "super_admin")
      );
    },
    setIsLoaded: (state, action) => {
      state.isLoaded = Boolean(action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.isAuthenticated = true;
        state.isAdmin = Boolean(
          action.payload.user &&
            (action.payload.user.role === "admin" ||
              action.payload.user.role === "super_admin")
        );
        state.isLoaded = true;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // Register
      .addCase(registerUser.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.isAuthenticated = true;
        state.isAdmin = Boolean(
          action.payload.user &&
            (action.payload.user.role === "admin" ||
              action.payload.user.role === "super_admin")
        );
        state.isLoaded = true;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // Refresh Session
      .addCase(refreshSession.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.isAuthenticated = true;
        state.isAdmin = Boolean(
          action.payload.user &&
            (action.payload.user.role === "admin" ||
              action.payload.user.role === "super_admin")
        );
        state.isLoaded = true;
        state.status = "succeeded";
        state.error = null;
      })
      .addCase(refreshSession.rejected, (state) => {
        state.user = null;
        state.accessToken = null;
        state.isAuthenticated = false;
        state.isAdmin = false;
        state.isLoaded = true;
        state.status = "idle";
      })

      // Logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.accessToken = null;
        state.isAuthenticated = false;
        state.isAdmin = false;
        state.status = "idle";
        state.error = null;
      })

      // Fetch Profile
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAdmin = Boolean(
          action.payload &&
            (action.payload.role === "admin" ||
              action.payload.role === "super_admin")
        );
      });
  },
});

export const { setCredentials, clearCredentials, setUser, setIsLoaded } =
  authSlice.actions;

export default authSlice.reducer;
