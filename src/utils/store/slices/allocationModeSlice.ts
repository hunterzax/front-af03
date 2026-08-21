import getCookieValue from '@/utils/getCookieValue';
import { getService } from '@/utils/postService';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const API_URL = process.env.NEXT_PUBLIC_API_URL
const token = getCookieValue("v4r2d9z5m3h0c1p0x7l");

export const fetchAllocationModeMaster = createAsyncThunk(
    'allocation/fetchAllocationModeMaster',
    async () => {
        // const response:any = await fetch(`${API_URL}/master/allocation-mode/mode`, {
        //     method: 'GET',
        //     headers: {
        //         'Content-Type': 'application/json',
        //         // 'Authorization': `Bearer ${token}`,
        //     },
        // });
        // const data = await response.json();
        // return data;
        return await getService(`/master/allocation-mode/mode`)
    }
);

const allocationModeSlice = createSlice({
    name: 'allocation',
    initialState: {
        loading: false,
        data: null,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchAllocationModeMaster.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchAllocationModeMaster.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload;
            })
            .addCase(fetchAllocationModeMaster.rejected, (state: any, action) => {
                state.loading = false;
                state.error = action.error.message;
            });
    },
});

export default allocationModeSlice.reducer;