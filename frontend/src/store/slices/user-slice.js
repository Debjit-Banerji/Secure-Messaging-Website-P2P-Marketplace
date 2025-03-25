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
export const loginUser = createAsyncThunk('user/login', (credentials, { dispatch, rejectWithValue }) => {
  try {
    console.log(credentials);
    const data = axiosInstance.post('/token/', credentials).then((response) => {
      setAuthToken(response.data.access);
      dispatch(getUserData());
      dispatch(setPassword(credentials.password));
      return response.data;
    });
    return data;
  } catch (error) {
    return rejectWithValue(error.response.data);
  }
});

export const getUserData = createAsyncThunk('user/getUserData', async (_, { rejectWithValue }) => {
  try {
    const data = await axiosInstance.get('/profile/');
    return data.data;
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
    await axiosInstance.post('/contacts/remove/', { contact_id: contactData.contactId });
    dispatch(fetchContacts());
  } catch (error) {
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
    error: null,
    loading: false,
    contacts: [],
  },
  reducers: {
    logoutUser(state) {
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      setAuthToken(null);
      state.password = "";
      state.privateKey = "";
    },
    setAllUsers(state){
      state.users = [];
    },
    setPassword(state, action){
      Object.assign(state, { password: action.payload });
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
export const { logoutUser, setAllUsers, setPassword } = userSlice.actions;
export default userSlice.reducer;