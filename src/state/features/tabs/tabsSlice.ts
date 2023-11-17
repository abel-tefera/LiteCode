import {
  PayloadAction,
  createAsyncThunk,
  createSelector,
  createSlice,
} from "@reduxjs/toolkit";
import { RootState } from "../../store";
import { FileStructure, Normalized, ValidExtensions } from "../structure/structureSlice";

export type Tab = { id: string; extension: ValidExtensions, isSelected: boolean };

interface TabSlice {
  open: Tab[];
}
const initialState: TabSlice = {
  open: [],
};

export const removeTabAsync = createAsyncThunk(
  "removeTabAsync",
  async (_, { getState }) => {
    const state = getState() as RootState;
    const normalized = state.structure.normalized;
    return normalized as Normalized;
  }
);

export const updateTabAsync = createAsyncThunk(
  "updateTabAsync",
  async (_, { getState }) => {
    const state = getState() as RootState;
    const normalized = state.structure.normalized;
    return normalized as Normalized;
  }
);

export const setActiveTabAsync = createAsyncThunk(
  "setActiveTabAsync",
  async (id: string, { getState }) => {
    const state = getState() as RootState;
    const normalized = state.structure.normalized;
    return { id, normalized: normalized as Normalized };
  }
);

export const tabsSlice = createSlice({
  name: "tabs",
  initialState,
  reducers: {
    selectTab: (state, action: PayloadAction<string>) => {
      state.open = state.open.map((tab) => {
        if (tab.id !== action.payload) {
          return {
            ...tab,
            isSelected: false,
          };
        }
        return {
          ...tab,
          isSelected: true,
        };
      });
    },
    closeTab: (state, action: PayloadAction<string>) => {
      state.open = state.open.filter(({ id }) => id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(removeTabAsync.fulfilled, (state, action) => {
        const normalized = action.payload;
        state.open = state.open.filter(
          (tab) =>
            normalized.files.allIds.find((id) => id === tab.id) !== undefined
        );
      })
      .addCase(setActiveTabAsync.fulfilled, (state, action) => {
        const normalized = action.payload.normalized;
        const tabId = action.payload.id;

        const item =
          normalized.files.byId[tabId] as FileStructure;

        if (state.open.filter(({ id }) => id === item.id).length === 0) {
          state.open = [
            ...state.open.map((tab) => {
              return { ...tab, isSelected: false };
            }),
            { id: item.id, extension: item.extension, isSelected: true },
          ];
        } else if (
          state.open.find(({ id }) => id === item.id)?.isSelected === false
        ) {
          state.open = state.open.map((tab) => {
            if (tab.id !== item.id) {
              return { ...tab, isSelected: false };
            }
            return {
              ...tab,
              isSelected: true,
            };
          });
        }
      });
  },
});

export const { closeTab, selectTab } = tabsSlice.actions;

export default tabsSlice.reducer;

export const activeTabs = createSelector(
  (state: RootState) => state.structure.normalized,
  (state: RootState) => state.tabs.open,
  (normalized: Normalized, openTabs: Tab[]) => {
    return openTabs.map((tab) => {
      const item = normalized.files.byId[tab.id];
      return {
        ...tab,
        extension: item.extension,
        wholeName: `${item.name}.${item.extension}`,
      };
    });
  }
);

export const selectedTab = createSelector(
  (state: RootState) => state.structure.normalized,
  (state: RootState) => state.tabs.open,
  (normalized: Normalized, openTabs: Tab[]) => {
    return openTabs
      .map((tab) => {
        const item = normalized.files.byId[tab.id];
        return {
          ...tab,
          extension: item.extension,
          wholeName: `${item.name}.${item.extension}`,
        };
      })
      .find(({ isSelected }) => isSelected)?.id;
  }
);
