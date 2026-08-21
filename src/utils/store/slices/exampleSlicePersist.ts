import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";

type ExampleState = {
    exampleIdPersist: number
    loading: boolean
}

const initialState: ExampleState = {
    exampleIdPersist: 0,
    loading: false
}

export const setValueAsync = createAsyncThunk(
    "examplePersist/setValueAsync", 
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

const examplePersistSlice = createSlice({
    name: "examplePersist",
    initialState: initialState,
    reducers:{
        setExamplePersist: (state:ExampleState, action:PayloadAction<number>) =>{
            state.exampleIdPersist = state.exampleIdPersist + 1
        },
        resetState: () => initialState
    },
    extraReducers: (val) => {
        val.addCase(setValueAsync.fulfilled, (state, action) => {
            state.exampleIdPersist =  action.payload
            state.loading = false
        })
        
        val.addCase(setValueAsync.rejected, (state, action) => {
            state.exampleIdPersist = 0
            state.loading = false
        })

        val.addCase(setValueAsync.pending, (state, action) => {
            state.loading = true
        })
    }
})

export const { setExamplePersist, resetState } = examplePersistSlice.actions
// export const examplePersistSelector = (store: RootState) => store.examplePersistReducer
export default examplePersistSlice.reducer
