import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { RootState } from "../../store";

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

export const editorSlice = createSlice({
  name: "editor",
  initialState,
  reducers: {
    setEditorWidthAdjusted: (state, action: PayloadAction<number>) => {
      state.editorWidthAdjusted = action.payload;
    },
    setActiveEditors: (state, action: PayloadAction<EditorData[]>) => {
      state.activeEditors = action.payload;
    }
  },
});

export const getEditorWidthAdjusted = (state: RootState) =>
  state.editor.editorWidthAdjusted;

export const getCurrentEditor = (state: RootState) =>
  state.editor.currentEditor;

export const { setEditorWidthAdjusted } = editorSlice.actions;
export default editorSlice.reducer;
