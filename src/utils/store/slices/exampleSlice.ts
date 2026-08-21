import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";

type ExampleState = {
    exampleId: number
    loading: boolean
}

const initialState: ExampleState = {
    exampleId: 0,
    loading: false
}

export const setValueAsync = createAsyncThunk(
    "example/setValueAsync", 
    async (value: number) => {
        const testAsync = new Promise<number>((resolve, reject) => {
            setTimeout(() => {
                if(value >= 0){
                    resolve(value)
                }else{
                    reject(Error(""))
                }
            }, 1000);
        })
        return await testAsync
    }
)

const exampleSlice = createSlice({
    name: "example",
    initialState: initialState,
    reducers:{
        setExample: (state:ExampleState, action:PayloadAction<number>) =>{
            state.exampleId = state.exampleId + 1
        },
    },
    extraReducers: (val) => {
        val.addCase(setValueAsync.fulfilled, (state, action) => {
            state.exampleId =  action.payload
            state.loading = false
        })
        
        val.addCase(setValueAsync.rejected, (state, action) => {
            state.exampleId = 0
            state.loading = false
        })

        val.addCase(setValueAsync.pending, (state, action) => {
            state.loading = true
        })
    }
})

export const { setExample } = exampleSlice.actions
export const exampleSelector = (store: RootState) => store.exampleReducer
export default exampleSlice.reducer
