import { PayloadAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { RootState } from "../../store";
import { FileStructure } from "../structure/structureSlice";

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
  activeEditors: EditorData[];
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
    unmappedPath: []
  },
  editorWidthAdjusted: 0,
};

export const setActiveEditorAsync = createAsyncThunk(
  "setActiveEditorAsync",
  async (id: string, { getState, fulfillWithValue }) => {
    const state = getState() as RootState;

    const file = state.structure.normalized.files.byId[id];
    const unmappedPath = file.path.filter((id) => id !== "/" && id !== "head")
    const actualPath = unmappedPath.map((id) => state.structure.normalized.folders.byId[id].name)
    actualPath.push(`${file.name}.${file.extension}`)
    return { file: file as FileStructure, actualPath: actualPath, unmappedPath: unmappedPath };
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
        ({ id }) => id !== action.payload
      );
    }
  },
  extraReducers: (builder) => {
    builder.addCase(setActiveEditorAsync.fulfilled, (state, action) => {
      const file = action.payload.file;
      const actualPath = action.payload.actualPath;
      const unmappedPath = action.payload.unmappedPath;
      if (file.id !== state.currentEditor.id){
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
          line: 1,
          content: file.content,
          unmappedPath: unmappedPath,
          path: actualPath,

        };
        state.activeEditors = [...state.activeEditors, state.currentEditor];
      } 
    });
  },
});

export const getEditorWidthAdjusted = (state: RootState) =>
  state.editor.editorWidthAdjusted;

export const getCurrentEditor = (state: RootState) =>
  state.editor.currentEditor;

export const { setEditorWidthAdjusted, removeActiveEditor } = editorSlice.actions;
export default editorSlice.reducer;
