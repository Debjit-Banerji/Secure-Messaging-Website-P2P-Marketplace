import { configureStore } from '@reduxjs/toolkit';
import axios from "axios";
import UserReducer from "./slices/user-slice";
import ChatReducer from "./slices/chat-slice";

// Base URL for Django Backend
export const BASE_URL = "http://localhost:8000/api";

export const host = `http://localhost:8000`;

// Axios instance with Authorization token
export const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  }
});

// const persistConfig = {
//   key: 'root',
//   storage,
// };

// const persistedUserReducer = persistReducer(persistConfig, userReducer);
// const persistedCourseReducer = persistReducer(persistConfig, courseReducer);
// const persistedTopicReducer = persistReducer(persistConfig, topicReducer);
// const persistedUserTopicReducer = persistReducer(persistConfig, userTopicReducer);
// const persistedNoteReducer = persistReducer(persistConfig, noteReducer);
// const persistedFacultyReducer = persistReducer(persistConfig, facultyReducer);

const store = configureStore({
    reducer: {
        user: UserReducer,
        chat: ChatReducer,
    },
//   reducer: {
//     user: persistedUserReducer,
//     course: persistedCourseReducer,
//     topic: persistedTopicReducer,
//     topicUser: persistedUserTopicReducer,
//     note: persistedNoteReducer,
//     faculty: persistedFacultyReducer,
//   },
});

export {store};
