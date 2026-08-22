import { getService } from '@/utils/postService';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL
// const token = getCookieValue("v4r2d9z5m3h0c1p0x7l");

export const fetchEmailNotiMgn = createAsyncThunk(
    'emailnotimgn/fetchEmailNotiMgn',
    async () => {
        try {
            const token = Cookies.get("v4r2d9z5m3h0c1p0x7l");
            if (!token) {
                throw new Error('Token is not available');
            }
            // const response:any = await axios.get(`${API_URL}/master/parameter/sub-email-notification-management`, {
            //     headers: {
            //         'Content-Type': 'application/json',
            //         'Authorization': `Bearer ${token}`,
            //     },
            //     timeout: 600000
            // });
            // return response.data;
            return await getService(`/master/parameter/sub-email-notification-management`)
        } catch (error: any) {
            // fetch error
        }
    }
);

const emailnotimgnSlice = createSlice({
    name: 'emailnotimgn',
    initialState: {
        loading: false,
        // data: null,
        data: [],
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchEmailNotiMgn.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchEmailNotiMgn.fulfilled, (state, action) => {
                state.loading = false;
                // state.data = action.payload;
                state.data = action.payload || [];
            })
            .addCase(fetchEmailNotiMgn.rejected, (state: any, action) => {
                state.loading = false;
                state.data = [];
                state.error = action.error.message;
            });
    },
});

export default emailnotimgnSlice.reducer;