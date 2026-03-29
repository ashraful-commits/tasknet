import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

export const getTimeEntries = createAsyncThunk(
    'time/getTimeEntries',
    async (_, thunkAPI) => {
        try {
            const { token } = thunkAPI.getState().auth
            const config = { headers: { Authorization: `Bearer ${token}` } }
            const response = await axios.get('/api/v1/time/me', config)
            return response.data
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response.data.message)
        }
    }
)

export const startTime = createAsyncThunk(
    'time/startTime',
    async (data, thunkAPI) => {
        try {
            const { token } = thunkAPI.getState().auth
            const config = { headers: { Authorization: `Bearer ${token}` } }
            const response = await axios.post('/api/v1/time/start', data, config)
            return response.data
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response.data.message)
        }
    }
)

export const stopTime = createAsyncThunk(
    'time/stopTime',
    async (id, thunkAPI) => {
        try {
            const { token } = thunkAPI.getState().auth
            const config = { headers: { Authorization: `Bearer ${token}` } }
            const response = await axios.put(`/api/v1/time/stop/${id}`, {}, config)
            return response.data
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response.data.message)
        }
    }
)

const timeSlice = createSlice({
    name: 'time',
    initialState: {
        entries: [],
        activeEntry: null,
        isLoading: false,
        isError: false,
        message: ''
    },
    reducers: {
        reset: (state) => {
            state.isLoading = false
            state.isError = false
            state.message = ''
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(getTimeEntries.pending, (state) => {
                state.isLoading = true
            })
            .addCase(getTimeEntries.fulfilled, (state, action) => {
                state.isLoading = false
                state.entries = action.payload.data
                state.activeEntry = action.payload.data.find(e => e.isRunning) || null
            })
            .addCase(startTime.fulfilled, (state, action) => {
                state.activeEntry = action.payload.data
                state.entries.unshift(action.payload.data)
            })
            .addCase(stopTime.fulfilled, (state, action) => {
                state.activeEntry = null
                const index = state.entries.findIndex(e => e._id === action.payload.data._id)
                if (index !== -1) state.entries[index] = action.payload.data
            })
    }
})

export const { reset } = timeSlice.actions
export default timeSlice.reducer
