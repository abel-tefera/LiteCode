import {
  PayloadAction,
  createAsyncThunk,
  createSelector,
  createSlice,
} from "@reduxjs/toolkit";
import { RootState } from "../../store";
import {
  FileStructure,
  Normalized,
  ValidExtensions,
} from "../structure/structureSlice";

export type Tab = { id: string; extension: ValidExtensions };

interface TabSlice {
  open: Tab[];
  selected: string;
  selectionStack: string[];
}

const initialState: TabSlice = {
  open: [],
  selected: "",
  selectionStack: [],
};

export const removeTabAsync = createAsyncThunk(
  "removeTabAsync",
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
      if (
        state.selected !== "" &&
        state.selectionStack[state.selectionStack.length - 1] !== state.selected
      ) {
        state.selectionStack = [...state.selectionStack, state.selected];
      }
      state.selected = action.payload;
      // state.open = [...state.open, { id: action.payload, extension: "" }];
      // state.open = state.open.map((tab) => {
      //   if (tab.id !== action.payload) {
      //     return {
      //       ...tab,
      //       isSelected: false,
      //     };
      //   }
      //   return {
      //     ...tab,
      //     isSelected: true,
      //   };
      // });
    },
    closeTab: (state, action: PayloadAction<string>) => {
      state.open = state.open.filter(({ id }) => id !== action.payload);
      state.selectionStack = state.selectionStack.filter(
        (id) => id !== action.payload
      );

      if (state.selected === action.payload) {
        console.log("HERE SELECTED", state.selected);
        const newSelectedStack = state.selectionStack.filter(
          (id) => id !== action.payload
        );
        const lastSelected = newSelectedStack.pop();
        state.selected = lastSelected || "";
        state.selectionStack = newSelectedStack;
      }
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
        state.selectionStack = state.selectionStack.filter(
          (selected) =>
            normalized.files.allIds.find((id) => id === selected) !== undefined
        );
        if (!state.open.find(({ id }) => id === state.selected)) {
          state.selected =
            state.selectionStack[state.selectionStack.length - 1];
          state.selectionStack = state.selectionStack.slice(
            0,
            state.selectionStack.length - 1
          );
        }
      })
      .addCase(setActiveTabAsync.fulfilled, (state, action) => {
        const normalized = action.payload.normalized;
        const tabId = action.payload.id;

        const item = normalized.files.byId[tabId] as FileStructure;

        if (state.open.filter(({ id }) => id === item.id).length === 0) {
          state.open = [
            ...state.open,
            { id: item.id, extension: item.extension },
          ];
        }
        if (
          (state.selected !== "" &&
            state.selectionStack[state.selectionStack.length - 1] !==
              state.selected) ||
          state.selectionStack.length === 0
        ) {
          state.selectionStack = [...state.selectionStack, state.selected];
        }
        state.selected = item.id;
      });
  },
});

export const { closeTab, selectTab } = tabsSlice.actions;

export default tabsSlice.reducer;

export const selectedTab = (state: RootState) => state.tabs.selected;

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

// export const selectedTab = createSelector(
//   (state: RootState) => state.structure.normalized,
//   (state: RootState) => state.tabs.open,
//   (state: RootState) => state.tabs.selected,
//   (normalized: Normalized, openTabs: Tab[], selected: string) => {
//     return openTabs
//       .map((tab) => {
//         const item = normalized.files.byId[tab.id];
//         return {
//           ...tab,
//           extension: item.extension,
//           wholeName: `${item.name}.${item.extension}`,
//         };
//       })
//       .find(({ id }) => id === selected)?.id;
//   }
// );
