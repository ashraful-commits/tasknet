import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const initialState = {
    comments: [],
    isLoading: false,
    isError: false,
    message: '',
};

// Add comment
export const addComment = createAsyncThunk('comments/add', async (commentData, thunkAPI) => {
    try {
        const token = thunkAPI.getState().auth.token;
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const response = await axios.post('/api/v1/comments', commentData, config);
        return response.data;
    } catch (error) {
        const message = error.response?.data?.message || error.message || error.toString();
        return thunkAPI.rejectWithValue(message);
    }
});

// Get task comments
export const getTaskComments = createAsyncThunk('comments/getTask', async (taskId, thunkAPI) => {
    try {
        const token = thunkAPI.getState().auth.token;
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const response = await axios.get(`/api/v1/comments/task/${taskId}`, config);
        return response.data;
    } catch (error) {
        const message = error.response?.data?.message || error.message || error.toString();
        return thunkAPI.rejectWithValue(message);
    }
});

const commentSlice = createSlice({
    name: 'comments',
    initialState,
    reducers: {
        resetComments: (state) => initialState,
    },
    extraReducers: (builder) => {
        builder
            .addCase(getTaskComments.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(getTaskComments.fulfilled, (state, action) => {
                state.isLoading = false;
                state.comments = action.payload.data;
            })
            .addCase(addComment.fulfilled, (state, action) => {
                state.comments.unshift(action.payload.data);
            });
    },
});

export const { resetComments } = commentSlice.actions;
export default commentSlice.reducer;
