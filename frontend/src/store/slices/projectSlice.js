import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const initialState = {
    projects: [],
    activeProject: null,
    isError: false,
    isSuccess: false,
    isLoading: false,
    message: '',
};

// Fetch user organizations projects
export const getProjects = createAsyncThunk('projects/getAll', async (orgId, thunkAPI) => {
    try {
        const token = thunkAPI.getState().auth.token;
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const response = await axios.get(`/api/v1/projects/org/${orgId}`, config);
        return response.data;
    } catch (error) {
        const message = error.response?.data?.message || error.message || error.toString();
        return thunkAPI.rejectWithValue(message);
    }
});

// Fetch single project
export const getProject = createAsyncThunk('projects/getOne', async (projectId, thunkAPI) => {
    try {
        const token = thunkAPI.getState().auth.token;
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const response = await axios.get(`/api/v1/projects/${projectId}`, config);
        return response.data;
    } catch (error) {
        const message = error.response?.data?.message || error.message || error.toString();
        return thunkAPI.rejectWithValue(message);
    }
});

// Create new project
export const createProject = createAsyncThunk('projects/create', async (projectData, thunkAPI) => {
    try {
        const token = thunkAPI.getState().auth.token;
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const response = await axios.post('/api/v1/projects', projectData, config);
        return response.data;
    } catch (error) {
        const message = error.response?.data?.message || error.message || error.toString();
        return thunkAPI.rejectWithValue(message);
    }
});

const projectSlice = createSlice({
    name: 'projects',
    initialState,
    reducers: {
        resetProjects: (state) => initialState,
        setActiveProject: (state, action) => {
            state.activeProject = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(getProjects.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(getProjects.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.projects = action.payload.data;
            })
            .addCase(getProjects.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            })
            .addCase(getProject.pending, (state) => {
                state.isLoading = true;
                state.isError = false;
                state.activeProject = null;
            })
            .addCase(getProject.fulfilled, (state, action) => {
                state.isLoading = false;
                state.activeProject = action.payload.data;
            })
            .addCase(getProject.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            })
            .addCase(createProject.fulfilled, (state, action) => {
                state.projects.push(action.payload.data);
            });
    },
});

export const { resetProjects, setActiveProject } = projectSlice.actions;
export default projectSlice.reducer;
