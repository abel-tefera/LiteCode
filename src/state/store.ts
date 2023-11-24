import { combineReducers, configureStore } from "@reduxjs/toolkit";
import structureReducer from "./features/structure/structureSlice";
import miniStructureReducer from "./features/structure/miniStructureSlice";
import editorReducer from "./features/editor/editorSlice";
import tabsReducer from "./features/tabs/tabsSlice";
import bundlerReducer from "./features/bundler/bundlerSlice";
import storage from "redux-persist/lib/storage"; // defaults to localStorage for web
// import { listenerMiddleware } from "./middleware/sendNormalized";
import { persistStore, persistReducer } from "redux-persist";

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["structure", "editor", "tabs", "miniStructure"],
};

const rootReducer = combineReducers({
  structure: structureReducer,
  editor: editorReducer,
  tabs: tabsReducer,
  miniStructure: miniStructureReducer,
  bundler: bundlerReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);
export const store = configureStore({
  reducer: persistedReducer,
  middleware: getDefaultMiddleware => getDefaultMiddleware(),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
