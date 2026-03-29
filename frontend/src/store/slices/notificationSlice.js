import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

export const getNotifications = createAsyncThunk(
    'notifications/getNotifications',
    async (_, thunkAPI) => {
        try {
            const token = thunkAPI.getState().auth.token
            const config = { headers: { Authorization: `Bearer ${token}` } }
            const response = await axios.get('/api/v1/notifications', config)
            return response.data
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to fetch notifications')
        }
    }
)

export const markAsRead = createAsyncThunk(
    'notifications/markAsRead',
    async (id, thunkAPI) => {
        try {
            const token = thunkAPI.getState().auth.token
            const config = { headers: { Authorization: `Bearer ${token}` } }
            await axios.put(`/api/v1/notifications/${id}/read`, {}, config)
            return id
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to update notification')
        }
    }
)

const notificationSlice = createSlice({
    name: 'notifications',
    initialState: {
        notifications: [],
        unreadCount: 0,
        isLoading: false,
        isError: false,
        message: ''
    },
    reducers: {
        reset: (state) => {
            state.isLoading = false
            state.isError = false
            state.message = ''
        },
        addNotification: (state, action) => {
            state.notifications.unshift(action.payload)
            state.unreadCount += 1
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(getNotifications.pending, (state) => {
                state.isLoading = true
            })
            .addCase(getNotifications.fulfilled, (state, action) => {
                state.isLoading = false
                state.notifications = action.payload.data
                state.unreadCount = action.payload.unreadCount
            })
            .addCase(markAsRead.fulfilled, (state, action) => {
                const notif = state.notifications.find(n => n._id === action.payload)
                if (notif && !notif.isRead) {
                    notif.isRead = true
                    state.unreadCount -= 1
                }
            })
    }
})

export const { reset, addNotification } = notificationSlice.actions
export default notificationSlice.reducer
