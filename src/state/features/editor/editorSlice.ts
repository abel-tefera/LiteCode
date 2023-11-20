import { PayloadAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { RootState } from "../../store";
import { FileStructure } from "../structure/structureSlice";
import { getPaths } from "./utils/pathUtil";

type KnownLanguages = "javascript" | "typescript" | "css" | "html" | "json";
type EditorData = {
  id: string;
  language: KnownLanguages;
  line: number;
  content: string;
  path: string[];
  unmappedPath: string[];
};

interface EditorSlice {
  activeEditors: string[];
  currentEditor: EditorData;
  editorWidthAdjusted: number;
}

const initialState: EditorSlice = {
  activeEditors: [],
  currentEditor: {
    id: "",
    language: "javascript",
    line: 1,
    content: "",
    path: [],
    unmappedPath: [],
  },
  editorWidthAdjusted: 0,
};

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
    removeActiveEditor: (state, action: PayloadAction<string>) => {
      state.activeEditors = state.activeEditors.filter(
        (id) => id !== action.payload
      );
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
          content: file.content,
          unmappedPath: unmappedPath,
          path: actualPath,
        };
        state.activeEditors = [...state.activeEditors, state.currentEditor.id];
      }
    });
  },
});

export const getEditorWidthAdjusted = (state: RootState) =>
  state.editor.editorWidthAdjusted;

export const getCurrentEditor = (state: RootState) =>
  state.editor.currentEditor;

export const { setEditorWidthAdjusted, removeActiveEditor } =
  editorSlice.actions;
export default editorSlice.reducer;
