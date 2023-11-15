import { configureStore, createListenerMiddleware } from "@reduxjs/toolkit";
import structureReducer from "./features/structure/structureSlice";
import editorReducer from "./features/editor/editorSlice";
import tabsReducer, {closeTab} from "./features/tabs/tabsSlice";
// import { listenerMiddleware } from "./middleware/sendNormalized";


export const store = configureStore({
  reducer: {
    structure: structureReducer,
    editor: editorReducer,
    tabs: tabsReducer,
  },
   middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware(),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
