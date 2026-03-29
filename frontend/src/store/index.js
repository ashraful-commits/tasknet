import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import projectReducer from './slices/projectSlice'
import taskReducer from './slices/taskSlice'
import orgReducer from './slices/orgSlice'
import notificationReducer from './slices/notificationSlice'
import timeReducer from './slices/timeSlice'
import commentReducer from './slices/commentSlice'

const store = configureStore({
    reducer: {
        auth: authReducer,
        projects: projectReducer,
        tasks: taskReducer,
        orgs: orgReducer,
        notifications: notificationReducer,
        time: timeReducer,
        comments: commentReducer
    },
})

export default store
