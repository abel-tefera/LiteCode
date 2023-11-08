import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../../store";
import { v4 as uuidv4 } from "uuid";

// type NestedRecord<T extends any[]>
//     = T extends [any, ...infer R]
//     ? Record<string, NestedRecord<R>>
//     : string

// type StructureFile = {
//   name: string;
//   type: 'file';
//   content: string;
//   classList: string[];
//   currentLineNumber: number;
//   extension: string;
// }

// type StructureFolder = {
//   name: string;
//   type: 'folder';
//   children: StructureFile[] | StructureFolder[];
//   classList: string[];
// }

// // Define a type for the slice state
// interface StructureState {
//   value: number;
//   structure: NestedRecord<string[]>;
// }

// Define the initial state using that type
const initialState = {
  id: "head",
  name: "root",
  type: "folder",
  children: [
    {
      id: "root",
      name: "Folder 1",
      children: [
        {
          id: "root2",
          name: "Folder 2",
          children: [
            {
              id: "root3",
              name: "Folder 3",
              type: "folder",
            },
            {
              id: "file1",
              name: "File 1",
              type: "file",
            },
          ],
        },
        {
          id: "root4",
          name: "Folder 4",
          type: "folder",
          children: [
            {
              id: "root5",
              name: "Folder 5",
              type: "folder",
            },
            {
              id: "file2",
              name: "File 2",
              type: "file",
            },
          ],
        },
      ],
    },
  ],
  classList: [],
};

export const structureSlice = createSlice({
  name: "structure",
  initialState,
  reducers: {
    addNode: (state, action) => {
      const newNode = {
        id: uuidv4(),
        name: action.payload.name,
        type: action.payload.type,
        parent: action.payload.parent,
        children: [],
        classList: [],
      };
      console.log("ADDING NODE", action.payload);
    },

    removeNode: (state) => {},

    renameNode: () => {
      console.log("RECIEVEIN");
    },
  },
});

export const { addNode, removeNode, renameNode } = structureSlice.actions;

export default structureSlice.reducer;
