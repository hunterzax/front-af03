import { createSlice, PayloadAction } from "@reduxjs/toolkit";


const configData = {
  accountLogin: "",
}

const login = createSlice({
  name: "login",
  initialState: configData,
  reducers: {
    updateLogin: (state, action: PayloadAction<any>) => {
      state = { ...state, ...action.payload };
      return state;
    },
    setDefault: (state) => {
      state = { ...state, ...configData };
      return state;
    },
  },
});
export default login;
// export default login.reducer;