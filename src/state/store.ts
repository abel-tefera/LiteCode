import { configureStore } from '@reduxjs/toolkit'
import structureReducer from "./features/structure/structureSlice";

export const store = configureStore({
  reducer: {
    structure: structureReducer,
  },
  middleware: [],
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch