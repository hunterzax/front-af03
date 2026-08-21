import getCookieValue from '@/utils/getCookieValue';
import { getService } from '@/utils/postService';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const API_URL = process.env.NEXT_PUBLIC_API_URL
const token = getCookieValue("v4r2d9z5m3h0c1p0x7l");

export const fetchAllocationStatusMaster = createAsyncThunk(
    'allocation/fetchAllocationStatusMaster',
    async () => {
        // const response:any = await fetch(`${API_URL}/master/allocation/allocation-status`, {
        //     method: 'GET',
        //     headers: {
        //         'Content-Type': 'application/json',
        //         // 'Authorization': `Bearer ${token}`,
        //     },
        // });
        // const data = await response.json();
        // return data;
        return await getService(`/master/allocation/allocation-status`)
    }
);

const allocationStatusSlice = createSlice({
    name: 'allocation',
    initialState: {
        loading: false,
        data: null,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchAllocationStatusMaster.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchAllocationStatusMaster.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload;
            })
            .addCase(fetchAllocationStatusMaster.rejected, (state: any, action) => {
                state.loading = false;
                state.error = action.error.message;
            });
    },
});

export default allocationStatusSlice.reducer;