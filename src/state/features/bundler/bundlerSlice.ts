import { type PayloadAction, createSlice } from "@reduxjs/toolkit";
import { type RootState } from "../../store";

interface BundlerSlice {
  output: {
    code: string;
    err: string;
  };
  isLoading: boolean;
}
const initialState: BundlerSlice = {
  output: {
    code: "",
    err: "",
  },
  isLoading: false,
};

export const bundlerSlice = createSlice({
  name: "bundler",
  initialState,
  reducers: {
    storeOutput: (
      state,
      action: PayloadAction<{ code: string; err: string }>,
    ) => {
      state.isLoading = false;
      state.output.err = action.payload.err;
      state.output.code = action.payload.code;
    },
    setIsLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
  },
});

export const getOutput = (state: RootState) => state.bundler.output;
export const bundlerLoading = (state: RootState) => state.bundler.isLoading;

export const { storeOutput, setIsLoading } = bundlerSlice.actions;
export default bundlerSlice.reducer;
