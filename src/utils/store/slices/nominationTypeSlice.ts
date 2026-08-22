import { getService } from '@/utils/postService';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL
// const token = getCookieValue("v4r2d9z5m3h0c1p0x7l");

export const fetchNominationType = createAsyncThunk(
    'nominationtype/fetchNominationType',
    async () => {
     
        try {
            const token = Cookies.get("v4r2d9z5m3h0c1p0x7l");
            if (!token) {
                throw new Error('Token is not available');
            }
            // const response:any = await axios.get(`${API_URL}/master/parameter/nomination-type`, {
            //     headers: {
            //         'Content-Type': 'application/json',
            //         'Authorization': `Bearer ${token}`,
            //     },
            //     timeout: 600000
            // });
            // return response.data;
            return await getService(`/master/parameter/nomination-type`)
        } catch (error: any) {
            // fetch error
        }
    }
);

const nominationTypeSlice = createSlice({
    name: 'nominationtype',
    initialState: {
        loading: false,
        data: null,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchNominationType.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchNominationType.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload;
            })
            .addCase(fetchNominationType.rejected, (state: any, action) => {
                state.loading = false;
                state.error = action.error.message;
            });
    },
});

export default nominationTypeSlice.reducer;