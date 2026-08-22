import getCookieValue from '@/utils/getCookieValue';
import { getService } from '@/utils/postService';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL
// const token = getCookieValue("v4r2d9z5m3h0c1p0x7l");

export const fetchUserGuideRoleAll = createAsyncThunk(
    'userguiderole/fetchUserGuideRoleAll',
    async () => {
        try {
            const token = Cookies.get("v4r2d9z5m3h0c1p0x7l");
            if (!token) {
                throw new Error('Token is not available');
            }
            // const response:any = await axios.get(`${API_URL}/master/parameter/user-guide-role-all`, {
            //     headers: {
            //         'Content-Type': 'application/json',
            //         'Authorization': `Bearer ${token}`,
            //         timeout: 600000
            //     },
            // });
            // return response.data;
            return await getService(`/master/parameter/user-guide-role-all`)
        } catch (error: any) {
            // fetch error
        }
    }
);

const userguideroleSlice = createSlice({
    name: 'userguiderole',
    initialState: {
        loading: false,
        data: null,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchUserGuideRoleAll.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchUserGuideRoleAll.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload;
            })
            .addCase(fetchUserGuideRoleAll.rejected, (state: any, action) => {
                state.loading = false;
                state.error = action.error.message;
            });
    },
});

export default userguideroleSlice.reducer;