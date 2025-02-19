import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {axiosInstance} from "../redux-store.js";

// Get user chats
export const getChats = createAsyncThunk('user/getChats', async (userCreds, { rejectWithValue }) => {
  try {
    const { data } = await axiosInstance.get(`/chats/${userCreds.id}/`);
    return data;
  } catch (error) {
    return rejectWithValue(error.response.data);
  }
});

// Send a chat message
export const sendChat = createAsyncThunk('user/sendChat', async (chatData, { rejectWithValue }) => {
  try {
    const { data } = await axiosInstance.post('/send-chat/', chatData);
    return data;
  } catch (error) {
    return rejectWithValue(error.response.data);
  }
});

// Redux slice
const chatSlice = createSlice({
  name: 'chat',
  initialState: {
    chats: [],
  },
  extraReducers: (builder) => {
    builder
      // Get Chats
      .addCase(getChats.fulfilled, (state, action) => {
        state.chats = action.payload;
      })

      // Send Chat
      .addCase(sendChat.fulfilled, (state, action) => {
        state.chats.push(action.payload);
      });
  },
});

export default chatSlice.reducer;