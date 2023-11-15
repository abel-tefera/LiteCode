import {
  PayloadAction,
  createAsyncThunk,
  createDraftSafeSelector,
  createSlice,
} from "@reduxjs/toolkit";
import { RootState } from "../../store";
import {
  FileStructure,
  Normalized,
  ValidExtensions,
} from "../structure/structureSlice";
import { useSelector } from "react-redux";

type Tab = { id: string; isSelected: boolean };

interface TabSlice {
  tabs: Tab[];
}
const initialState: TabSlice = {
  tabs: [],
};

export const removeTabAsync = createAsyncThunk(
  "removeTabAsync",
  async (_, { getState }) => {
    // @ts-ignore
    const normalized = getState().structure.normalized;
    return normalized as Normalized;
  }
);

export const updateTabAsync = createAsyncThunk(
  "updateTabAsync",
  async (_, { getState }) => {
    // @ts-ignore
    const normalized = getState().structure.normalized;
    return normalized as Normalized;
  }
);

export const setActiveTabAsync = createAsyncThunk(
  "setActiveTabAsync",
  async (id, { getState }) => {
    // @ts-ignore
    const normalized = getState().structure.normalized;
    return { id, normalized: normalized as Normalized };
  }
);

export const tabsSlice = createSlice({
  name: "tabs",
  initialState,
  reducers: {
    selectTab: (state, action: PayloadAction<string>) => {
      state.tabs = state.tabs.map((tab) => {
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
      state.tabs = state.tabs.filter(({ id }) => id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(removeTabAsync.fulfilled, (state, action) => {
        const normalized = action.payload;

        state.tabs = state.tabs.filter(
          (tab) =>
            normalized.files.allIds.find((id) => id === tab.id) !== undefined
        );
      })
      .addCase(setActiveTabAsync.fulfilled, (state, action) => {
        const normalized = action.payload.normalized;
        const tabId = action.payload.id;

        const item =
          // @ts-ignore
          normalized.files.byId[tabId] as FileStructure;

        if (state.tabs.filter(({ id }) => id === item.id).length === 0) {
          state.tabs = [
            ...state.tabs.map((tab) => {
              return { ...tab, isSelected: false };
            }),
            // @ts-ignore
            { id: item.id, extension: item.extension, isSelected: true },
          ];
        } else if (
          state.tabs.find(({ id }) => id === item.id)?.isSelected === false
        ) {
          state.tabs = state.tabs.map((tab) => {
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

export const activeTabs = (state: RootState) => {
  return state.tabs.tabs.map((tab) => {
    const item = state.structure.normalized.files.byId[tab.id];
    return {
      ...tab,
      extension: item.extension,
      wholeName: `${item.name}.${item.extension}`,
    };
  });
};
