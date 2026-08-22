import { getService } from '@/utils/postService';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL
// const token = getCookieValue("v4r2d9z5m3h0c1p0x7l");

export const fetchContractPoint = createAsyncThunk(
    'contractpoint/fetchContractPoint',
    async () => {
        // const response:any = await fetch(`${API_URL}/master/asset/contract-point`, {
        //     method: 'GET',
        //     headers: {
        //         'Content-Type': 'application/json',
        //         'Authorization': `Bearer ${token}`,
        //     },
        // });
        // const data = await response.json();
        // return data;

        try {
            const token = Cookies.get("v4r2d9z5m3h0c1p0x7l");

            if (!token) {
                throw new Error('Token is not available');
            }
            // const response:any = await axios.get(`${API_URL}/master/asset/contract-point`, {
            //     headers: {
            //         'Content-Type': 'application/json',
            //         'Authorization': `Bearer ${token}`,
            //     },
            //     timeout: 600000
            // });
            // return response.data;
            return await getService(`/master/asset/contract-point`)
        } catch (error: any) {
            // fetch error
        }
    }
);

const contractPointSlice = createSlice({
    name: 'contractpoint',
    initialState: {
        loading: false,
        data: null,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchContractPoint.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchContractPoint.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload;
            })
            .addCase(fetchContractPoint.rejected, (state: any, action) => {
                state.loading = false;
                state.error = action.error.message;
            });
    },
});

export default contractPointSlice.reducer;