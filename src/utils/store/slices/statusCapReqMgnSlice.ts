import getCookieValue from '@/utils/getCookieValue';
import { getService } from '@/utils/postService';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const API_URL = process.env.NEXT_PUBLIC_API_URL
const token = getCookieValue("v4r2d9z5m3h0c1p0x7l");

export const fetchStatCapReqMgnMaster = createAsyncThunk(
    'statcapreqmgn/fetchStatCapReqMgnMaster',
    async () => {
        // const response:any = await fetch(`${API_URL}/master/capacity/status-capacity-request-management`, {
        //     method: 'GET',
        //     headers: {
        //         'Content-Type': 'application/json',
        //         'Authorization': `Bearer ${token}`,
        //     },
        // });
        // const data = await response.json();
        // return data;
        return await getService(`/master/capacity/status-capacity-request-management`)
    }
);

const statcapreqmgnSlice = createSlice({
    name: 'statcapreqmgn',
    initialState: {
        loading: false,
        data: null,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchStatCapReqMgnMaster.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchStatCapReqMgnMaster.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload;
            })
            .addCase(fetchStatCapReqMgnMaster.rejected, (state: any, action) => {
                state.loading = false;
                state.error = action.error.message;
            });
    },
});

export default statcapreqmgnSlice.reducer;