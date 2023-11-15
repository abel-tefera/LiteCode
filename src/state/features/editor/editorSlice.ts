import { PayloadAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { RootState } from "../../store";
import { FileStructure } from "../structure/structureSlice";

type EditorData = {
  id: string;
  language: string;
  line: number;
  initialValue: string;
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
    language: "",
    line: 1,
    initialValue: "",
  },
  editorWidthAdjusted: 0,
};

export const setActiveEditorAsync = createAsyncThunk(
  "setActiveEditorAsync",
  async (id, { getState }) => {
    // @ts-ignore
    const file = getState().structure.normalized.files.byId[id];
    return { file: file as FileStructure };
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
      if (file.id !== state.currentEditor.id){
        state.currentEditor = {
          id: file.id,
          language: file.extension,
          line: 1,
          initialValue: file.content,
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
