import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {axiosInstance} from "../redux-store.js";

// Get user chats
export const getChats = createAsyncThunk('user/getChats', async (userCreds, { rejectWithValue }) => {
  try {
    console.log(userCreds);
    const data = await axiosInstance.get(`/chats/${userCreds.id}/`);
    console.log(data);
    return data.data;
  } catch (error) {
    return rejectWithValue(error.response.data);
  }
});

// Send a chat message
export const sendChat = createAsyncThunk('user/sendChat', async (chatData, { rejectWithValue }) => {
  try {
    console.log(chatData);
    const data = await axiosInstance.post('/send-chat/', chatData);
    console.log(data);
    return data.data;
  } catch (error) {
    return rejectWithValue(error.response.data);
  }
});

// Redux slice
const chatSlice = createSlice({
  name: 'chat',
  initialState: {
    sent_chats: [],
    received_chats: [],
  },
  extraReducers: (builder) => {
    builder
      .addCase(getChats.fulfilled, (state, action) => {
        state.sent_chats = action.payload.sent;
        state.received_chats = action.payload.received;
      })

      // Send Chat
      .addCase(sendChat.fulfilled, (state, action) => {
        state.sent_chats.push(action.payload);
      });
  },
});

export default chatSlice.reducer;