// @ts-nocheck
import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../../store";
import { v4 as uuidv4 } from "uuid";
import { bfsNodeAction, dfsNodeAction } from "./utils/traversal";

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
  normalized: {
    files: {
      byId: {},
      allIds: [],
    },
    folders: {
      byId: {},
      allIds: [],
    },
  },
  initialFolder: {
    id: "head",
    name: "head",
    type: "folder",
    collapsed: false,
    selected: false,
    children: [
      {
        id: "folder1Id",
        name: "Folder 1",
        children: [
          {
            id: "folder2Id",
            name: "Folder 2",
            children: [
              {
                id: "folder3Id",
                name: "Folder 3",
                type: "folder",
                selected: false,
                collapsed: true,
                children: [],
              },
              {
                id: "file1Id",
                name: "File1.js",
                type: "file",
                extension: "js",
              },
            ],
            type: "folder",
            selected: false,
            collapsed: true,
          },
          {
            id: "folder4Id",
            name: "Folder 4",
            type: "folder",
            selected: false,
            collapsed: false,
            children: [
              {
                id: "folder5Id",
                name: "Folder 5",
                type: "folder",
                selected: true,
                collapsed: true,
                children: [],
              },
              {
                id: "file2Id",
                name: "File2.js",
                type: "file",
                extension: "js",
              },
            ],
          },
        ],
        type: "folder",
        collapsed: false,
        selected: false,
      },
    ],
  },
  selected: null,
};

export const structureSlice = createSlice({
  name: "structure",
  initialState,
  reducers: {
    addNode: (state, action) => {
      const newChild = {
        id: uuidv4(),
        ...action.payload,
      };

      bfsNodeAction(state.initialFolder, action.payload.id, (item) => {
        item.children.push(newChild);
      });
    },

    removeNode: (state, action) => {
      dfsNodeAction(
        state.initialFolder.children,
        action.payload.id,
        (item, parent) => {
          if (!parent) {
            parent = state.initialFolder;
          }
          parent.children = parent.children.filter(
            (child) => child.id !== item.id
          );
        }
      );
    },

    renameNode: (state, action) => {
      dfsNodeAction(state.initialFolder.children, action.payload.id, (item) => {
        item.name = "BAZZAR";
      });
    },

    normalizeState: (state) => {
      const mapStructureRecursively = (structure: any, normalized: any) => {
        for (let item of structure) {
          if (item.type === "folder") {
            normalized.folders.byId[item.id] = item;
            normalized.folders.allIds.push(item.id);
            mapStructureRecursively(item.children, normalized);
          } else if (item.type === "file") {
            normalized.files.byId[item.id] = item;
            normalized.files.allIds.push(item.id);
          }
        }
      };
      mapStructureRecursively(state.initialFolder.children, state.normalized);
    },

    collapseOrExpand: (state, action) => {
      if (action.payload.item.type === "folder") {
        const { item, collapse } = action.payload;
        bfsNodeAction(state.initialFolder, item.id, (folder) => {
          if (collapse) {
            folder.collapsed = !folder.collapsed;
          } else {
            folder.collapsed = false;
          }
        });
        state.selected = item.id;
      }
    },

    copyNode: (state, action) => {
      const newNode = {
        id: uuidv4(),
        ...action.payload,
      };

      bfsNodeAction(state.initialFolder, action.payload.targetId, (folder) => {
        folder.children.push = newNode;
      });
    },

    setSelected: (state, action) => {
      state.selected = action.payload.id;
    },
  },
});

export const getInitialSet = (state: any) =>
  state.structure.initialFolder.children;

export const selectedItem = (state: any) => state.structure.selected;

export const {
  addNode,
  removeNode,
  renameNode,
  collapseOrExpand,
  normalizeState,
  setSelected,
} = structureSlice.actions;

export default structureSlice.reducer;
