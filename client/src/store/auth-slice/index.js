import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { mergeTempCartWithServer } from "../shop/cart-slice";

// Configure axios defaults
const getBackendUrl = () => {
  const hostname = window.location.hostname;
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:5000';
  }
  return import.meta.env.VITE_API_URL || 'https://roshjewellery.onrender.com';
};
axios.defaults.baseURL = getBackendUrl();
axios.defaults.withCredentials = true;
axios.defaults.headers.common['Accept'] = 'application/json';
axios.defaults.headers.common['Content-Type'] = 'application/json';
axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

// Add request interceptor for debugging
axios.interceptors.request.use(request => {
  // Ensure credentials are included
  request.withCredentials = true;
  
  console.log('Starting Request:', {
    url: request.url,
    method: request.method,
    headers: request.headers,
    withCredentials: request.withCredentials,
    baseURL: request.baseURL
  });
  return request;
});

// Add response interceptor for debugging
axios.interceptors.response.use(
  response => {
    console.log('Response received:', {
      status: response.status,
      headers: response.headers,
      data: response.data,
      cookies: document.cookie
    });
    return response;
  },
  error => {
    console.error('Response error:', {
      status: error.response?.status,
      headers: error.response?.headers,
      data: error.response?.data,
      cookies: document.cookie,
      error: error.message,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        headers: error.config?.headers,
        withCredentials: error.config?.withCredentials
      }
    });
    return Promise.reject(error);
  }
);

const initialState = {
  isAuthenticated: false,
  isLoading: true,
  user: null,
};

export const registerUser = createAsyncThunk(
  "/auth/register",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        "/api/auth/register",
        formData,
        {
          withCredentials: true,
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Registration failed");
    }
  }
);

export const loginUser = createAsyncThunk(
  "/auth/login",
  async (formData, { dispatch, rejectWithValue }) => {
    try {
      const response = await axios.post(
        "/api/auth/login",
        formData,
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }
      );
      
      // If login is successful, verify the session was set
      if (response.data.success) {
        // Wait a moment for the cookie to be set
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Verify the session by making a check-auth request
        try {
          const authCheck = await axios.get("/api/auth/check-auth", {
            withCredentials: true,
            headers: {
              'Accept': 'application/json'
            }
          });
          
          if (!authCheck.data.success) {
            console.error('Session verification failed after login');
            return rejectWithValue("Session verification failed");
          }
          
          // If we get here, session is verified, proceed with cart merge
          try {
            await dispatch(mergeTempCartWithServer(response.data.user.id)).unwrap();
          } catch (mergeError) {
            console.error('Error merging cart:', mergeError);
          }
          
          // Redirect based on user role
          const redirectPath = response.data.user.role === 'admin' 
            ? '/admin/reports'
            : '/shop/home';
          window.location.href = redirectPath;
        } catch (verifyError) {
          console.error('Session verification error:', verifyError);
          return rejectWithValue("Failed to verify session after login");
        }
      }
      
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      return rejectWithValue(error.response?.data || "Login failed");
    }
  }
);

export const logoutUser = createAsyncThunk(
  "/auth/logout",

  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        "/api/auth/logout",
        {},
        {
          withCredentials: true,
        }
      );
      window.location.href = "/shop/home"; // Redirect to home after successful logout
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Logout failed");
    }
  }
);

export const checkAuth = createAsyncThunk(
  "/auth/check-auth",
  async (_, { rejectWithValue }) => {
    try {
      console.log('Checking auth status...');
      console.log('Current cookies:', document.cookie);
      
      const response = await axios.get(
        "/api/auth/check-auth",
        {
          withCredentials: true,
          headers: {
            "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
            "Accept": "application/json",
            "Content-Type": "application/json"
          },
        }
      );
      
      console.log('Auth check response:', {
        status: response.status,
        data: response.data,
        headers: response.headers,
        cookies: document.cookie
      });

      // If middleware is bypassed, we'll still get a success response
      if (response.data.message === "Auth check bypassed") {
        console.log('Auth middleware is bypassed');
        return {
          success: true,
          message: "Auth check bypassed",
          user: null
        };
      }
      
      return response.data;
    } catch (error) {
      console.error('Check auth error:', {
        status: error.response?.status,
        data: error.response?.data,
        headers: error.response?.headers,
        cookies: document.cookie,
        error: error.message,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          headers: error.config?.headers,
          withCredentials: error.config?.withCredentials
        }
      });

      return rejectWithValue(error.response?.data || "Authentication check failed");
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action) => {},
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        // Don't set user or isAuthenticated here since we'll do that after login
      })
      .addCase(registerUser.rejected, (state) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
      })
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.success ? action.payload.user : null;
        state.isAuthenticated = action.payload.success;
      })
      .addCase(loginUser.rejected, (state) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
      })
      .addCase(checkAuth.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.success ? action.payload.user : null;
        state.isAuthenticated = action.payload.success;
      })
      .addCase(checkAuth.rejected, (state) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
      })
      .addCase(logoutUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
      })
      .addCase(logoutUser.rejected, (state) => {
        state.isLoading = false;
        // Keep the current state in case of logout failure
      });
  },
});

export const { setUser } = authSlice.actions;
export default authSlice.reducer;
