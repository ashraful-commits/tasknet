import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const initialState = {
    tasks: [],
    isError: false,
    isSuccess: false,
    isLoading: false,
    message: '',
};

const getAuthToken = (thunkAPI) => thunkAPI.getState().auth.token;

// Fetch all project tasks
export const getTasks = createAsyncThunk('tasks/getAll', async (projectId, thunkAPI) => {
    try {
        const token = getAuthToken(thunkAPI);
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const response = await axios.get(`/api/v1/tasks/project/${projectId}`, config);
        return response.data;
    } catch (error) {
        const message = error.response?.data?.message || error.message || error.toString();
        return thunkAPI.rejectWithValue(message);
    }
});

export const getOrgTasks = createAsyncThunk('tasks/getOrgTasks', async (orgId, thunkAPI) => {
    try {
        const token = getAuthToken(thunkAPI);
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const response = await axios.get(`/api/v1/tasks/org/${orgId}`, config);
        return response.data;
    } catch (error) {
        const message = error.response?.data?.message || error.message || error.toString();
        return thunkAPI.rejectWithValue(message);
    }
});

// Create new task
export const createTask = createAsyncThunk('tasks/create', async (taskData, thunkAPI) => {
    try {
        const token = getAuthToken(thunkAPI);
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const response = await axios.post('/api/v1/tasks', taskData, config);
        return response.data;
    } catch (error) {
        const message = error.response?.data?.message || error.message || error.toString();
        return thunkAPI.rejectWithValue(message);
    }
});

// Update task
export const updateTask = createAsyncThunk('tasks/update', async ({ id, taskData }, thunkAPI) => {
    try {
        const token = getAuthToken(thunkAPI);
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const response = await axios.put(`/api/v1/tasks/${id}`, taskData, config);
        return response.data;
    } catch (error) {
        const message = error.response?.data?.message || error.message || error.toString();
        return thunkAPI.rejectWithValue(message);
    }
});

// Reorder tasks (Kanban drag and drop)
export const reorderTasks = createAsyncThunk('tasks/reorder', async (reorderData, thunkAPI) => {
    try {
        const token = getAuthToken(thunkAPI);
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const response = await axios.put('/api/v1/tasks/reorder', reorderData, config);
        return response.data;
    } catch (error) {
        const message = error.response?.data?.message || error.message || error.toString();
        return thunkAPI.rejectWithValue(message);
    }
});

const taskSlice = createSlice({
    name: 'tasks',
    initialState,
    reducers: {
        resetTasks: (state) => initialState,
        // Optimistic reorder for UI performance
        optimisticReorder: (state, action) => {
            const { movedTask, remainingTasks } = action.payload;
            state.tasks = [...remainingTasks, movedTask];
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(getTasks.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(getTasks.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.tasks = action.payload.data;
            })
            .addCase(getOrgTasks.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(getOrgTasks.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.tasks = action.payload.data;
            })
            .addCase(getOrgTasks.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            })
            .addCase(createTask.fulfilled, (state, action) => {
                state.tasks.push(action.payload.data);
            })
            .addCase(updateTask.fulfilled, (state, action) => {
                state.tasks = state.tasks.map((task) =>
                    task._id === action.payload.data._id ? action.payload.data : task
                );
            });
    },
});

export const { resetTasks, optimisticReorder } = taskSlice.actions;
export default taskSlice.reducer;
