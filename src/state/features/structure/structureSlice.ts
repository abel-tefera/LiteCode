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
  selected: "main",
  contextSelected: {
    id: null,
    type: null,
    e: null,
  },
  toCopy: { id: null, type: null, isCut: null },
};

export const structureSlice = createSlice({
  name: "structure",
  initialState,
  reducers: {
    addNode: (state, action) => {
      const { value, inputType } = action.payload;
      const newChild = {
        id: `${inputType}-${uuidv4()}`,
        name: value,
        type: inputType,
        extension:
          inputType === "file" ? value.split(".").reverse()[0] : undefined,
        selected: false,
        collapsed: inputType === "folder" ? true : undefined,
        children: inputType === "folder" ? [] : undefined,
      };
      if (state.contextSelected.id === "head") {
        state.initialFolder.children.push(newChild);
      } else if (state.contextSelected.id !== null) {
        bfsNodeAction(state.initialFolder, state.contextSelected.id, (item) => {
          item.children.push(newChild);
        });
      }
      state.normalized[inputType + "s"].byId[newChild.id] = newChild;
      state.normalized[inputType + "s"].allIds.push(newChild.id);
    },

    removeNode: (state, action) => {
      console.log("REMOVING", state, action);
      // dfsNodeAction(
      //   state.initialFolder.children,
      //   state.contextSelected.id,
      //   (item, parent) => {
      //     if (!parent) {
      //       parent = state.initialFolder;
      //     }
      //     parent.children = parent.children.filter(
      //       (child) => child.id !== item.id
      //     );
      //   }
      // );

      // const { type } = state.contextSelected.type;
      // state.normalized[type + "s"].byId[state.contextSelected.id] = undefined;
      // state.normalized[type + "s"].allIds = state.normalized[
      //   type + "s"
      // ].allIds.filter((id) => id !== state.contextSelected.id);
    },

    renameNode: (state, action) => {
      dfsNodeAction(
        state.initialFolder.children,
        state.contextSelected.id,
        (item) => {
          item.name = action.payload.value;
        }
      );
      state.normalized[state.contextSelected.type + "s"].byId[
        state.contextSelected.id
      ].name = action.payload.value;
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
        if (action.payload.collapse) {
          state.selected = action.payload.item.id;
          state.contextSelected.id = null;
        }
      }
    },

    copyNode: (state) => {
      const toCopy =
        state.normalized[state.toCopy.type + "s"].byId[state.toCopy.id];

      if (state.toCopy.isCut) {
        console.log("ISCUR");
        
        structureSlice.caseReducers.removeNode(state, );
      }

      const newNode = {
        ...toCopy,
        id: state.toCopy.isCut ? toCopy.id: `${state.toCopy.type}-${uuidv4()}`,
      };

      const reAssign = (node: any) => {
        for (let item of node) {
          item.id = `${item.type}-${uuidv4()}`;
          item.selected = false;
          if (item.collapsed !== undefined) {
            item.collapsed = true;
          }
          if (item.type === "folder") {
            reAssign(item.children);
          }
        }
      };

      if (state.toCopy.type === "folder" && state.toCopy.isCut !== true) {
        reAssign(toCopy.children);
      }

      bfsNodeAction(state.initialFolder, state.contextSelected.id, (folder) => {
        folder.collapsed = false;
        folder.children.push(newNode);
      });

      state.normalized[`${newNode.type}s`].byId[newNode.id] = newNode;
      state.normalized[`${newNode.type}s`].allIds.push(newNode.id);

      state.toCopy = { id: null, type: null, isCut: null };
    },

    setSelected: (state, action) => {
      state.selected = action.payload.id;
    },

    contextClick: (state, action) => {
      const { id, type, threeDot } = action.payload;
      if (id !== null) {
        state.contextSelected.id = id;
        state.contextSelected.type = type;
        if (threeDot) {
          state.contextSelected.e = threeDot;
        }
      } else {
        state.contextSelected.id = "head";
        state.contextSelected.type = "folder";
      }
    },

    setToCopy: (state, action) => {
      state.toCopy.id = action.payload.id;
      state.toCopy.type = action.payload.type;
      state.toCopy.isCut = action.payload.isCut;
    },
  },
});

export const getInitialSet = (state: any) =>
  state.structure.initialFolder.children;

export const selectedItem = (state: any) => state.structure.selected;
export const contextSelectedEvent = (state: any) =>
  state.structure.contextSelected.e;

export const contextSelectedItem = (state: any) =>
  state.structure.contextSelected.id;

export const contextSelectedItemType = (state: any) =>
  state.structure.contextSelected.type;

export const clipboard = (state: any) => state.structure.toCopy;

export const getItem = (state) => {
  if (
    !state.structure.normalized ||
    !state.structure.contextSelected.id ||
    !state.structure.contextSelected.type
  )
    return;
  const item =
    state.structure.normalized[`${state.structure.contextSelected.type}s`].byId[
      state.structure.contextSelected.id
    ];
  return item;
};

export const {
  addNode,
  removeNode,
  renameNode,
  collapseOrExpand,
  normalizeState,
  setSelected,
  contextClick,
  setToCopy,
  copyNode,
} = structureSlice.actions;

export default structureSlice.reducer;
