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

// Get group chats
export const getGroupChats = createAsyncThunk('group/getGroupChats', async (groupId, { rejectWithValue }) => {
  try {
    const data = await axiosInstance.get(`/group-chats/${groupId}/`);
    console.log(data);
    return data.data;
  } catch (error) {
    return rejectWithValue(error.response.data);
  }
});

// Send a group chat message
export const sendGroupChat = createAsyncThunk('group/sendGroupChat', async (groupChatData, { rejectWithValue }) => {
  try {
    console.log(groupChatData);
    const data = await axiosInstance.post('/send-group-chat/', groupChatData);
    console.log(data);
    return data.data;
  } catch (error) {
    return rejectWithValue(error.response.data);
  }
});

// Create a new group
export const createGroup = createAsyncThunk('group/createGroup', async (groupData, { rejectWithValue }) => {
  try {
    console.log(groupData);
    const data = await axiosInstance.post('/create-group/', groupData);
    console.log(data);
    return data.data;
  } catch (error) {
    return rejectWithValue(error.response.data);
  }
});

// Add a member to a group
export const addGroupMember = createAsyncThunk('group/addMember', async ({ groupId, memberId }, { rejectWithValue }) => {
  try {
    console.log(`Adding member ${memberId} to group ${groupId}`);
    const data = await axiosInstance.post('/add-group-member/', { groupId, memberId });
    console.log(data);
    return data.data;
  } catch (error) {
    return rejectWithValue(error.response.data);
  }
});

// Remove a member from a group
export const removeGroupMember = createAsyncThunk('group/removeMember', async ({ groupId, memberId }, { rejectWithValue }) => {
  try {
    console.log(`Removing member ${memberId} from group ${groupId}`);
    const data = await axiosInstance.post('/remove-group-member/', { groupId, memberId });
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
    groups: [],
    group_chats: {},
    loading: false,
    error: null
  },
  extraReducers: (builder) => {
    builder
      // Get Chats
      .addCase(getChats.pending, (state) => {
        state.loading = true;
      })
      .addCase(getChats.fulfilled, (state, action) => {
        state.loading = false;
        state.sent_chats = action.payload.sent;
        state.received_chats = action.payload.received;
        state.error = null;
      })
      .addCase(getChats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Send Chat
      .addCase(sendChat.pending, (state) => {
        state.loading = true;
      })
      .addCase(sendChat.fulfilled, (state, action) => {
        state.loading = false;
        state.sent_chats.push(action.payload);
        state.error = null;
      })
      .addCase(sendChat.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Get Group Chats
      .addCase(getGroupChats.pending, (state) => {
        state.loading = true;
      })
      .addCase(getGroupChats.fulfilled, (state, action) => {
        state.loading = false;
        state.groups = action.payload.groups;
        state.group_chats = action.payload.group_chats;
        state.error = null;
      })
      .addCase(getGroupChats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Send Group Chat
      .addCase(sendGroupChat.pending, (state) => {
        state.loading = true;
      })
      .addCase(sendGroupChat.fulfilled, (state, action) => {
        state.loading = false;
        const { groupId, message } = action.payload;
        
        // Add the new message to the appropriate group
        if (!state.group_chats[groupId]) {
          state.group_chats[groupId] = [];
        }
        state.group_chats[groupId].push(message);
        state.error = null;
      })
      .addCase(sendGroupChat.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create Group
      .addCase(createGroup.pending, (state) => {
        state.loading = true;
      })
      .addCase(createGroup.fulfilled, (state, action) => {
        state.loading = false;
        state.groups.push(action.payload);
        state.group_chats[action.payload.id] = [];
        state.error = null;
      })
      .addCase(createGroup.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Add Group Member
      .addCase(addGroupMember.pending, (state) => {
        state.loading = true;
      })
      .addCase(addGroupMember.fulfilled, (state, action) => {
        state.loading = false;
        const { groupId, member } = action.payload;
        
        // Find the group to update
        const groupIndex = state.groups.findIndex(group => group.id === groupId);
        if (groupIndex !== -1) {
          state.groups[groupIndex].members.push(member);
        }
        state.error = null;
      })
      .addCase(addGroupMember.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Remove Group Member
      .addCase(removeGroupMember.pending, (state) => {
        state.loading = true;
      })
      .addCase(removeGroupMember.fulfilled, (state, action) => {
        state.loading = false;
        const { groupId, memberId } = action.payload;
        
        // Find the group to update
        const groupIndex = state.groups.findIndex(group => group.id === groupId);
        if (groupIndex !== -1) {
          state.groups[groupIndex].members = state.groups[groupIndex].members.filter(
            member => member.id !== memberId
          );
        }
        state.error = null;
      })
      .addCase(removeGroupMember.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default chatSlice.reducer;
