import { type PayloadAction, createSlice } from '@reduxjs/toolkit'
import { type RootState } from '../../store'

interface BundlerSlice {
  output: {
    code: string
    err: string
  }
}
const initialState: BundlerSlice = {
  output: {
    code: '',
    err: ''
  }
}

export const bundlerSlice = createSlice({
  name: 'bundler',
  initialState,
  reducers: {
    storeOutput: (
      state,
      action: PayloadAction<{ code: string, err: string }>
    ) => {
      state.output.err = action.payload.err
      state.output.code = action.payload.code
    }
  }
})

export const getOutput = (state: RootState) => state.bundler.output

export const { storeOutput } = bundlerSlice.actions
export default bundlerSlice.reducer
