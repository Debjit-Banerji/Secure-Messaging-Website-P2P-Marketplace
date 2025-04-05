import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {axiosInstance} from "../redux-store.js";

// Get user chats
export const getChats = createAsyncThunk('user/getChats', async (userData, { rejectWithValue }) => {
  try {
    const { data } = await axiosInstance.get(`/chats/${userData.id}/`);
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

// Get group messages
export const getGroupChats = createAsyncThunk('group/getGroupChats', async (groupId, { rejectWithValue }) => {
  try {
    const { data } = await axiosInstance.get(`/groups/${groupId.groupId}/messages/`);
    console.log(data);
    return data;
  } catch (error) {
    return rejectWithValue(error.response.data);
  }
});

// Send a group chat message
export const sendGroupChat = createAsyncThunk('group/sendGroupChat', async ({ groupId, messageData }, { dispatch, rejectWithValue }) => {
  try {
    const { data } = await axiosInstance.post(`/groups/${groupId}/send_message/`, messageData);
    dispatch(getGroupChats({groupId: groupId}))
  } catch (error) {
    return rejectWithValue(error.response.data);
  }
});

// Fetch user groups
export const fetchUserGroups = createAsyncThunk('group/fetchUserGroups', async (_, { rejectWithValue }) => {
  try {
    const { data } = await axiosInstance.get('/groups/');
    return data;
  } catch (error) {
    return rejectWithValue(error.response.data);
  }
});

export const fetchUserDataForGroup = createAsyncThunk('group/fetchUserDataForGroup', async (groupId, { rejectWithValue }) => {
  try {
    console.log(groupId);
    const data = await axiosInstance.get(`/group-membership/${groupId.groupId}/`);
    console.log(data);
    return data.data;
  } catch (error) {
    return rejectWithValue(error.response.data);
  }
});

export const fetchGroupDetails = createAsyncThunk('group/fetchGroupDetails', async (groupId, { rejectWithValue }) => {
  try {
    console.log(groupId);
    const data = await axiosInstance.get(`/groups/${groupId.groupId}/`);
    console.log(data);
    return data.data;
  } catch (error) {
    return rejectWithValue(error.response.data);
  }
});

// Create a new group
export const createGroup = createAsyncThunk('group/createGroup', async (groupData, { dispatch, rejectWithValue }) => {
  try {
    const { data } = await axiosInstance.post('/groups/create/', groupData);
    return data;
  } catch (error) {
    return rejectWithValue(error.response.data);
  }
});

// Add a member to a group
export const addGroupMember = createAsyncThunk('group/addMember', async ({ groupId, memberId, encryptedKey }, { rejectWithValue }) => {
  try {
    const { data } = await axiosInstance.post(`/groups/${groupId}/add_member/`, { member_id: memberId, encrypted_key: encryptedKey });
    return { groupId, member: data };
  } catch (error) {
    return rejectWithValue(error.response.data);
  }
});

// Remove a member from a group
export const removeGroupMember = createAsyncThunk('group/removeMember', async ({ groupId, memberId }, { rejectWithValue }) => {
  try {
    const { data } = await axiosInstance.delete(`/groups/${groupId}/remove_member/${memberId}/`);
    return { groupId, memberId };
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
    group_chats: {}, // Store messages per group
    cur_group_data: null,
    loading: false,
    error: null,
    cur_group: {},
  },
  reducers: {
    logoutChats(state) {
      state.sent_chats = [];
      state.received_chats = [];
      state.groups = [];
      state.group_chats = {}; // Store messages per group
      state.cur_group_data = null;
      state.loading = false;
      state.error = null;
      state.cur_group = {};
    },
    changeChats(state) {
      state.sent_chats = [];
      state.received_chats = [];
      state.group_chats = {}; // Store messages per group
      state.cur_group_data = null;
      state.loading = false;
      state.error = null;
      state.cur_group = {};
    },
  },
  extraReducers: (builder) => {
    builder
      // Get Chats
      .addCase(getChats.pending, (state) => { state.loading = true; })
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
      .addCase(sendChat.pending, (state) => { state.loading = true; })
      .addCase(sendChat.fulfilled, (state, action) => {
        state.loading = false;
        state.sent_chats.push(action.payload);
        state.error = null;
      })
      .addCase(sendChat.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch User Groups
      .addCase(fetchUserGroups.pending, (state) => { state.loading = true; })
      .addCase(fetchUserGroups.fulfilled, (state, action) => {
        state.loading = false;
        state.groups = action.payload;
        state.error = null;
      })
      .addCase(fetchUserGroups.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(fetchUserDataForGroup.pending, (state) => { state.loading = true; })
      .addCase(fetchUserDataForGroup.fulfilled, (state, action) => {
        state.loading = false;
        state.cur_group_data = action.payload;
        state.error = null;
      })
      .addCase(fetchUserDataForGroup.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(fetchGroupDetails.pending, (state) => { state.loading = true; })
      .addCase(fetchGroupDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.cur_group = action.payload;
        state.error = null;
      })
      .addCase(fetchGroupDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Get Group Chats
      .addCase(getGroupChats.pending, (state) => { state.loading = true; })
      .addCase(getGroupChats.fulfilled, (state, action) => {
        state.loading = false;
        state.group_chats = action.payload;
        state.error = null;
      })
      .addCase(getGroupChats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Send Group Chat
      .addCase(sendGroupChat.pending, (state) => { state.loading = true; })
      .addCase(sendGroupChat.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(sendGroupChat.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create Group
      .addCase(createGroup.pending, (state) => { state.loading = true; })
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
      .addCase(addGroupMember.pending, (state) => { state.loading = true; })
      .addCase(addGroupMember.fulfilled, (state, action) => {
        state.loading = false;
        if (state.cur_group) state.cur_group.members.push(action.payload.member);
        state.error = null;
      })
      .addCase(addGroupMember.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Remove Group Member
      .addCase(removeGroupMember.pending, (state) => { state.loading = true; })
      .addCase(removeGroupMember.fulfilled, (state, action) => {
        state.loading = false;
        if (state.cur_group) {
          state.cur_group.members = state.cur_group.members?.filter(member => member.id !== action.payload.memberId);
        }
        state.error = null;
      })
      .addCase(removeGroupMember.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { logoutChats, changeChats } = chatSlice.actions;
export default chatSlice.reducer;