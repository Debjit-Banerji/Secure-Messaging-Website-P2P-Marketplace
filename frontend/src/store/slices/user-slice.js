import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {axiosInstance} from "../redux-store.js";

// Helper function to set auth token in headers
const setAuthToken = (token) => {
  if (token) {
    axiosInstance.defaults.headers["Authorization"] = `Bearer ${token}`;
  } else {
    delete axiosInstance.defaults.headers["Authorization"];
  }
};

// Login (Token Authentication)
export const loginUser = createAsyncThunk('user/login', (credentials, { rejectWithValue }) => {
  try {
    console.log(credentials);
    const data  = axiosInstance.post('/token/', credentials);
    console.log(data);
    setAuthToken(data.access);
    return data;
  } catch (error) {
    return rejectWithValue(error.response.data);
  }
});

// Refresh Token
export const refreshToken = createAsyncThunk('user/refreshToken', async (refreshToken, { rejectWithValue }) => {
  try {
    const { data } = await axiosInstance.post('/token/refresh/', { refresh: refreshToken });
    setAuthToken(data.access);
    return data;
  } catch (error) {
    return rejectWithValue(error.response.data);
  }
});

// Register a new user
export const registerUser = createAsyncThunk('user/register', async (userData, { rejectWithValue }) => {
  try {
    console.log(userData);
    const { data } = await axiosInstance.post('/register/', userData);
    return data;
  } catch (error) {
    return rejectWithValue(error.response.data);
  }
});

// Search users
export const searchUsers = createAsyncThunk('user/searchUsers', async (query, { rejectWithValue }) => {
  try {
    console.log(query);
    const data = await axiosInstance.get(`/search-users/?q=${query.searchTerm}`);
    console.log(data);
    return data.data;
  } catch (error) {
    return rejectWithValue(error.response.data);
  }
});

// Update user profile
export const updateProfile = createAsyncThunk('user/updateProfile', async (profileData, { rejectWithValue }) => {
  try {
    const { data } = await axiosInstance.put('/update-profile/', profileData);
    return data;
  } catch (error) {
    return rejectWithValue(error.response.data);
  }
});

// Search friends and groups
export const searchFriendsGroups = createAsyncThunk('user/searchFriendsGroups', async (_, { rejectWithValue }) => {
  try {
    const { data } = await axiosInstance.get('/search-friends-groups/');
    return data;
  } catch (error) {
    return rejectWithValue(error.response.data);
  }
});

// Redux slice
const userSlice = createSlice({
  name: 'user',
  initialState: {
    user: null,
    users: [],
    friendsGroups: [],
    token: null,
    refreshToken: null,
    error: null,
    loading: false,
  },
  reducers: {
    logoutUser(state) {
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      setAuthToken(null);
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.fulfilled, (state, action) => {
        state.token = action.payload.access;
        state.refreshToken = action.payload.refresh;
        state.user = action.payload.user;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.error = action.payload;
      })
      
      // Token Refresh
      .addCase(refreshToken.fulfilled, (state, action) => {
        state.token = action.payload.access;
      })
      
      // Register User
      .addCase(registerUser.fulfilled, (state, action) => {
      })

      .addCase(registerUser.rejected, (state, action) => {
        state.error = action.payload;
        console.log(state.error);
      })

      // Search Users
      .addCase(searchUsers.fulfilled, (state, action) => {
        state.users = action.payload;
      })

      // Update Profile
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.user = action.payload;
      })

      // Search Friends and Groups
      .addCase(searchFriendsGroups.fulfilled, (state, action) => {
        state.friendsGroups = action.payload;
      })
  },
});

// Export actions and reducer
export const { logoutUser } = userSlice.actions;
export default userSlice.reducer;