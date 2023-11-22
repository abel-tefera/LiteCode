import {
  PayloadAction,
  createAsyncThunk,
  createSelector,
  createSlice,
} from "@reduxjs/toolkit";
import { RootState } from "../../store";
import { FileStructure, Normalized } from "../structure/structureSlice";
import { getPaths } from "./utils/pathUtil";

type KnownLanguages = "javascript" | "typescript" | "css" | "html" | "json";
type EditorData = {
  id: string;
  language: KnownLanguages;
  line: number;
  path: string[];
  unmappedPath: string[];
};

interface EditorSlice {
  // activeEditors: string[];
  currentEditor: EditorData;
  editorWidthAdjusted: number;
}

const initialState: EditorSlice = {
  // activeEditors: [],
  currentEditor: {
    id: "",
    language: "javascript",
    line: 1,
    path: [],
    unmappedPath: [],
  },
  editorWidthAdjusted: 0,
};

export const removeActiveEditorAsync = createAsyncThunk(
  "removeActiveEditorAsync",
  async (id: string, { getState, dispatch }) => {
    const state = getState() as RootState;
    const selectedTab = state.tabs.selected;
    if (selectedTab !== "") {
      await dispatch(setActiveEditorAsync({ id: selectedTab, line: 0 }));
    }
    return { id };
  }
);

export const setActiveEditorAsync = createAsyncThunk(
  "setActiveEditorAsync",
  async (
    editorProps: { id: string; line: number },
    { getState, fulfillWithValue }
  ) => {
    const state = getState() as RootState;
    const normalized = state.structure.normalized;
    const file = normalized.files.byId[editorProps.id];
    const [unmappedPath, actualPath] = getPaths(file, normalized);
    // actualPath.push(`${file.name}.${file.extension}`);
    return {
      file: file as FileStructure,
      actualPath: actualPath,
      unmappedPath: unmappedPath,
      openAtLine: editorProps.line,
    };
  }
);

export const editorSlice = createSlice({
  name: "editor",
  initialState,
  reducers: {
    setEditorWidthAdjusted: (state, action: PayloadAction<number>) => {
      state.editorWidthAdjusted = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(setActiveEditorAsync.fulfilled, (state, action) => {
      const file = action.payload.file;
      const actualPath = action.payload.actualPath;
      const unmappedPath = action.payload.unmappedPath;
      const openAtLine = action.payload.openAtLine;
      if (file.id !== state.currentEditor.id) {
        let language;
        switch (file.extension) {
          case "js":
            language = "javascript";
            break;
          case "ts":
            language = "typescript";
            break;
          case "css":
            language = "css";
            break;
          default:
            language = "javascript";
            break;
        }
        state.currentEditor = {
          id: file.id,
          language: language as KnownLanguages,
          line: openAtLine !== 0 ? openAtLine : 1,
          unmappedPath: unmappedPath,
          path: actualPath,
        };
        // if (state.activeEditors.filter((_id) => _id === file.id).length === 0) {
        //   state.activeEditors = [
        //     ...state.activeEditors,
        //     state.currentEditor.id,
        //   ];
        // }
      }
    });
    builder.addCase(removeActiveEditorAsync.fulfilled, (state, action) => {
      const { id } = action.payload;
      // state.activeEditors = state.activeEditors.filter((_id) => _id !== id);
      if (state.currentEditor.id === id) {
      }
    });
  },
});

export const getEditorWidthAdjusted = (state: RootState) =>
  state.editor.editorWidthAdjusted;

export const getCurrentEditor = createSelector(
  (state: RootState) => state.structure.normalized,
  (state: RootState) => state.editor.currentEditor,
  (normalized: Normalized, editor: EditorData) => {
    const file = normalized.files.byId[editor.id];
    const [unmappedPath, actualPath] = getPaths(file, normalized);
    return {
      ...editor,
      path: actualPath,
      unmappedPath: unmappedPath,
      content: file.content,
    };
  }
);

export const { setEditorWidthAdjusted } = editorSlice.actions;
export default editorSlice.reducer;
