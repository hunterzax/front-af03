// divisionSlice.js
import getCookieValue from '@/utils/getCookieValue';
import { getService } from '@/utils/postService';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const API_URL = process.env.NEXT_PUBLIC_API_URL
const token = getCookieValue("v4r2d9z5m3h0c1p0x7l");

// Async action to fetch division data
export const fetchDivisionMaster = createAsyncThunk(
  'division/fetchDivisionMaster',
  async () => {
    if (!token) {
      throw new Error('Token is not available');
    }
    // const response:any = await fetch(`${API_URL}/master/account-manage/division-master`, {
    //   method: 'GET',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': `Bearer ${token}`,
    //   },
    // });
    // const data = await response.json();
    // return data;
    return await getService(`/master/account-manage/division-master`)
  }
);

const divisionSlice = createSlice({
  name: 'division',
  initialState: {
    loading: false,
    data: null,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDivisionMaster.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchDivisionMaster.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchDivisionMaster.rejected, (state: any, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export default divisionSlice.reducer;
