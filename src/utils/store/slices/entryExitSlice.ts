import { getService } from '@/utils/postService';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import Cookies from 'js-cookie';
const API_URL = process.env.NEXT_PUBLIC_API_URL
// const token = getCookieValue("v4r2d9z5m3h0c1p0x7l");

// Async action to fetch division data
export const fetchEntryExit = createAsyncThunk(
    'entryexit/fetchEntryExit',
    async (_, { getState, rejectWithValue }) => {
        try {
            const token = Cookies.get("v4r2d9z5m3h0c1p0x7l");

            if (!token) {
                throw new Error('Token is not available');
            }

            // const response:any = await axios.get(`${API_URL}/master/asset/entry-exit`, {
            //     headers: {
            //         'Content-Type': 'application/json',
            //         'Authorization': `Bearer ${token}`,
            //     },
            //     timeout: 600000
            // });
            // return response.data;
            return await getService(`/master/asset/entry-exit`)

        } catch (error: any) {
            // fetch error
            return rejectWithValue(error.response?.data || 'Failed to fetch data');
        }
    }
);

const entryExitSlice = createSlice({
    name: 'entryexit',
    initialState: {
        loading: false,
        data: null,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchEntryExit.pending, (state) => {
                state.loading = true;
                state.error = null; // Reset error when loading
            })
            .addCase(fetchEntryExit.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload;
            })
            .addCase(fetchEntryExit.rejected, (state: any, action) => {
                state.loading = false;
                // state.error = action.error.message;
                state.error = action.payload || 'Something went wrong';

            });
    },
});

export default entryExitSlice.reducer;