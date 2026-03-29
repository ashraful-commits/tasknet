import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const initialState = {
    organizations: [],
    activeOrganization: JSON.parse(localStorage.getItem('activeOrg')) || null,
    isError: false,
    isSuccess: false,
    isLoading: false,
    message: '',
};

// Fetch user organizations
export const getOrganizations = createAsyncThunk('orgs/getAll', async (_, thunkAPI) => {
    try {
        const token = thunkAPI.getState().auth.token;
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const response = await axios.get('/api/v1/orgs', config);
        return response.data;
    } catch (error) {
        const message = error.response?.data?.message || error.message || error.toString();
        return thunkAPI.rejectWithValue(message);
    }
});

// Create organization
export const createOrganization = createAsyncThunk('orgs/create', async (orgData, thunkAPI) => {
    try {
        const token = thunkAPI.getState().auth.token;
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const response = await axios.post('/api/v1/orgs', orgData, config);
        return response.data;
    } catch (error) {
        const message = error.response?.data?.message || error.message || error.toString();
        return thunkAPI.rejectWithValue(message);
    }
});

// Update organization
export const updateOrganization = createAsyncThunk('orgs/update', async ({ id, orgData }, thunkAPI) => {
    try {
        const token = thunkAPI.getState().auth.token;
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const response = await axios.put(`/api/v1/orgs/${id}`, orgData, config);
        return response.data;
    } catch (error) {
        const message = error.response?.data?.message || error.message || error.toString();
        return thunkAPI.rejectWithValue(message);
    }
});

const orgSlice = createSlice({
    name: 'orgs',
    initialState,
    reducers: {
        resetOrgs: (state) => initialState,
        setActiveOrganization: (state, action) => {
            state.activeOrganization = action.payload;
            localStorage.setItem('activeOrg', JSON.stringify(action.payload));
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(getOrganizations.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(getOrganizations.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.organizations = action.payload.data;
                // Sync activeOrganization if it's part of the new list
                if (state.activeOrganization) {
                    const fresh = action.payload.data.find(o => o._id === state.activeOrganization._id);
                    if (fresh) {
                        state.activeOrganization = fresh;
                        localStorage.setItem('activeOrg', JSON.stringify(fresh));
                    }
                } else if (action.payload.data.length > 0) {
                    state.activeOrganization = action.payload.data[0];
                    localStorage.setItem('activeOrg', JSON.stringify(action.payload.data[0]));
                }
            })
            .addCase(getOrganizations.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            })
            .addCase(createOrganization.fulfilled, (state, action) => {
                state.organizations.push(action.payload.data);
            })
            .addCase(updateOrganization.fulfilled, (state, action) => {
                state.organizations = state.organizations.map((org) =>
                    org._id === action.payload.data._id ? action.payload.data : org
                );
                if (state.activeOrganization?._id === action.payload.data._id) {
                    state.activeOrganization = action.payload.data;
                    localStorage.setItem('activeOrg', JSON.stringify(action.payload.data));
                }
            });
    },
});

export const { resetOrgs, setActiveOrganization } = orgSlice.actions;
export default orgSlice.reducer;
