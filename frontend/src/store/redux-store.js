import { configureStore } from '@reduxjs/toolkit';

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
    reducer: {},
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
