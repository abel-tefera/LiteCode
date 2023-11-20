import { configureStore, createListenerMiddleware } from "@reduxjs/toolkit";
import structureReducer from "./features/structure/structureSlice";
import miniStructureReducer from "./features/structure/miniStructureSlice";
import editorReducer from "./features/editor/editorSlice";
import tabsReducer from "./features/tabs/tabsSlice";
import bundlerReducer from "./features/bundler/bundlerSlice";
// import { listenerMiddleware } from "./middleware/sendNormalized";

export const store = configureStore({
  reducer: {
    structure: structureReducer,
    editor: editorReducer,
    tabs: tabsReducer,
    miniStructure: miniStructureReducer,
    bundler: bundlerReducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware(),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
