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
export const loginUser = createAsyncThunk('user/login', async (credentials, { dispatch, rejectWithValue }) => {
  try {
    const response = await axiosInstance.post('/token/', credentials);
    setAuthToken(response.data.access);
    dispatch(getUserData());
    dispatch(setPassword(credentials.password));
    dispatch(setRefreshToken(response.data.refresh));
    
    // Setup token refresh interval (this will be done in the fulfilled case)
    dispatch(setupTokenRefresh());

    return response.data;
  } catch (error) {
    return rejectWithValue(error.response.data);
  }
});

// Set up token refresh interval
export const setupTokenRefresh = () => (dispatch, getState) => {
  // Clear any existing interval first
  const currentInterval = getState().user.refreshInterval;
  if (currentInterval) {
    clearInterval(currentInterval);
  }
  
  // Set up new interval to refresh token every 10 minutes
  const refreshInterval = 10 * 60 * 1000; // 10 minutes in milliseconds
  const intervalId = setInterval(() => {
    const refreshToken = getState().user.refreshToken;
    if (refreshToken) {
      dispatch(refreshTokenAsync(refreshToken));
    }
  }, refreshInterval);
  
  // Store the interval ID
  dispatch(setRefreshInterval(intervalId));
};

export const getUserData = createAsyncThunk('user/getUserData', async (_, { rejectWithValue }) => {
  try {
    const data = await axiosInstance.get('/profile/');
    return data.data;
  } catch (error) {
    return rejectWithValue(error.response.data);
  }
});

// Refresh Token
export const refreshTokenAsync = createAsyncThunk('user/refreshToken', async (refreshToken, { dispatch, rejectWithValue }) => {
  try {
    console.log("Refreshing token...");
    const { data } = await axiosInstance.post('/token/refresh/', { refresh: refreshToken });
    console.log(data.access);
    setAuthToken(data.access);
    if (data.refresh) {
      dispatch(setRefreshToken(data.refresh));
    }
    return data;
  } catch (error) {
    return rejectWithValue(error.response.data);
  }
});

// Register a new user
export const registerUser = createAsyncThunk('user/register', async (userData, { rejectWithValue }) => {
  try {
    const { data } = await axiosInstance.post('/register/', userData);
    return data;
  } catch (error) {
    return rejectWithValue(error.response.data);
  }
});

// Search users
export const searchUsers = createAsyncThunk('user/searchUsers', async (query, { rejectWithValue }) => {
  try {
    const data = await axiosInstance.get(`/search-users/?q=${query.searchTerm}`);
    return data.data;
  } catch (error) {
    return rejectWithValue(error.response.data);
  }
});

// Update user profile
export const updateProfile = createAsyncThunk('user/updateProfile', async (profileData, { dispatch, rejectWithValue }) => {
  try {
    await axiosInstance.put('/update-profile/', profileData);
    dispatch(getUserData());
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

export const fetchContacts = createAsyncThunk('user/fetchContacts', async (_, { rejectWithValue }) => {
  try {
    const data = await axiosInstance.get('/contacts/');
    console.log(data.data);
    return data.data;
  } catch (error) {
    return rejectWithValue(error.response.data);
  }
});

export const addContacts = createAsyncThunk('user/addContacts', async (contactData, { dispatch, rejectWithValue }) => {
  try {
    await axiosInstance.post('/contacts/add/', {
      contact_id: contactData.contactId,
    });
    dispatch(fetchContacts());
  } catch (error) {
    return rejectWithValue(error.response.data);
  }
});

export const removeContacts = createAsyncThunk('user/removeContacts', async (contactData, { dispatch, rejectWithValue }) => {
  try {
    await axiosInstance.post('/contacts/remove/', { contact_id: contactData.id });
    dispatch(fetchContacts());
  } catch (error) {
    return rejectWithValue(error.response.data);
  }
});

export const reportAndRemoveContact = createAsyncThunk('user/reportAndRemoveContact', async (data, { dispatch, rejectWithValue }) => {
  try {
    await axiosInstance.post('/contacts/report/', { contact_id: data.id, reason: data.reason });
    dispatch(removeContacts({ id: data.id }));
  }
  catch (error) {
    return rejectWithValue(error.response.data);
  }
});

// Generate and send OTP
export const sendOTP = createAsyncThunk('user/sendOTP', async (email, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post('/send-otp/', { email });
      return data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Verify OTP
export const verifyOTP = createAsyncThunk('user/verifyOTP', async ({ email, otp }, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post('/verify-otp/', { email, otp });
      return data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Redux slice
const userSlice = createSlice({
  name: 'user',
  initialState: {
    user: null,
    password: "",
    users: [],
    friendsGroups: [],
    token: null,
    refreshToken: null,
    refreshInterval: null,
    error: null,
    loading: false,
    contacts: [],
    otpLoading: false,
    otpSent: false,
  },
  reducers: {
    logoutUser(state) {
      // Clear the refresh token interval when logging out
      if (state.refreshInterval) {
        clearInterval(state.refreshInterval);
      }
      
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.refreshInterval = null;
      setAuthToken(null);
      state.password = "";
      state.privateKey = "";
      state.otpLoading = false;
      state.otpSent = false;
    },
    setAllUsers(state) {
      state.users = [];
    },
    setPassword(state, action) {
      Object.assign(state, { password: action.payload });
    },
    setRefreshToken(state, action) {
      state.refreshToken = action.payload;
    },
    setRefreshInterval(state, action) {
      // Clear existing interval if there is one
      if (state.refreshInterval) {
        clearInterval(state.refreshInterval);
      }
      state.refreshInterval = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.fulfilled, (state, action) => {
        state.token = action.payload.access;
        state.refreshToken = action.payload.refresh;
      })

      .addCase(loginUser.rejected, (state, action) => {
        state.error = action.payload;
      })

      .addCase(getUserData.fulfilled, (state, action) => {
        state.user = action.payload;
        console.log(state.user);
      })
      
      // Token Refresh
      .addCase(refreshTokenAsync.fulfilled, (state, action) => {
        state.token = action.payload.access;
        // If the response includes a new refresh token, update it
        if (action.payload.refresh) {
          state.refreshToken = action.payload.refresh;
        }
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
      })

      // Search Friends and Groups
      .addCase(searchFriendsGroups.fulfilled, (state, action) => {
        state.friendsGroups = action.payload;
      })

      .addCase(fetchContacts.fulfilled, (state, action) => {
        state.contacts = action.payload;
      }) 

      .addCase(addContacts.fulfilled, (state, action) => {
      })

      .addCase(removeContacts.fulfilled, (state, action) => {
      })
      
      .addCase(sendOTP.pending, (state) => {
        state.otpLoading = true;
        state.otpError = null;
      })
      .addCase(sendOTP.fulfilled, (state, action) => {
        state.otpLoading = false;
        state.otpSent = true;
      })
      .addCase(sendOTP.rejected, (state, action) => {
        state.otpLoading = false;
        state.otpError = action.payload;
      })
      .addCase(verifyOTP.pending, (state) => {
        state.otpLoading = true;
        state.otpError = null;
      })
      .addCase(verifyOTP.fulfilled, (state, action) => {
        state.otpLoading = false;
        state.otpVerified = true;
      })
      .addCase(verifyOTP.rejected, (state, action) => {
        state.otpLoading = false;
        state.otpError = action.payload;
      });
  },
});

// Export actions and reducer
export const { logoutUser, setAllUsers, setPassword, setRefreshToken, setRefreshInterval } = userSlice.actions;
export default userSlice.reducer;