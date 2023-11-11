// @ts-nocheck
import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../../store";
import { v4 as uuidv4 } from "uuid";
import { bfsNodeAction, dfsNodeAction } from "./utils/traversal";
import { prepareSort } from "./utils/sorting";

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
    // children: [],
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
            collapsed: true,
          },
          {
            id: "folder4Id",
            name: "Folder 4",
            type: "folder",
            collapsed: false,
            children: [
              {
                id: "folder5Id",
                name: "Folder 5",
                type: "folder",
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
      },
    ],
  },
  selected: "head",
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
        collapsed: inputType === "folder" ? true : undefined,
        children: inputType === "folder" ? [] : undefined,
      };
      if (state.contextSelected.id === "head") {
        state.initialFolder.children.push(newChild);
      } else if (state.contextSelected.id !== null) {
        bfsNodeAction(state.initialFolder, state.contextSelected.id, (item) => {
          state.normalized.folders.byId[state.contextSelected.id].children.push(
            newChild
          );
          item.children.push(newChild);
        });
      }
      state.normalized[inputType + "s"].byId[newChild.id] = newChild;
      state.normalized[inputType + "s"].allIds.push(newChild.id);
      const subTree = state.normalized.folders.byId[state.contextSelected.id];
      structureSlice.caseReducers.sortStructure(_, {
        payload: { ...subTree },
      });
    },

    removeNode: (state, action) => {
      const id = action.payload.id
        ? action.payload.id
        : state.contextSelected.id;
      const type = action.payload.type
        ? action.payload.type
        : state.contextSelected.type;

      dfsNodeAction(state.initialFolder.children, id, (item, parent) => {
        if (!parent) {
          parent = state.initialFolder;
        }
        parent.children = parent.children.filter(
          (child) => child.id !== item.id
        );

        const deleteNodes = (subItems) => {
          for (let item of subItems) {
            const { id, type } = item;
            state.normalized[type + "s"].byId[id] = undefined;
            state.normalized[type + "s"].allIds = state.normalized[
              type + "s"
            ].allIds.filter((_id) => _id !== id);
            if (item.type === "folder") {
              deleteNodes(item.children);
            }
          }
        };
        if (item.type === "folder") {
          deleteNodes(item.children);
        }

        if (parent.children.length === 0) {
          parent.collapsed = true;
        }
      });

      state.normalized[type + "s"].byId[id] = undefined;
      state.normalized[type + "s"].allIds = state.normalized[
        type + "s"
      ].allIds.filter((_id) => _id !== id);
    },

    renameNode: (state, action) => {
      const parent = dfsNodeAction(
        state.initialFolder.children,
        state.contextSelected.id,
        (item, parent) => {
          item.name = action.payload.value;
          return parent;
        }
      );
      state.normalized[state.contextSelected.type + "s"].byId[
        state.contextSelected.id
      ].name = action.payload.value;
      const subTree = state.normalized.folders.byId[parent.id];
      structureSlice.caseReducers.sortStructure(_, {
        payload: { ...subTree },
      });
    },

    normalizeState: (state) => {
      state.normalized.folders.byId["head"] = state.initialFolder;
      state.normalized.folders.allIds.push("head");

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
      structureSlice.caseReducers.sortStructure(_, {
        payload: { ...state.initialFolder },
      });
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
      } else if (action.payload.item.type === "file") {
        state.selected = action.payload.item.id;
        state.contextSelected.id = null;
      }
    },

    copyNode: (state) => {
      const toCopy =
        state.normalized[state.toCopy.type + "s"].byId[state.toCopy.id];
      const dfs = (node: any, callback: any, children: any[] = []) => {
        for (let item of node) {
          callback(item);
          if (item.collapsed !== undefined) {
            item.collapsed = true;
          }
          if (item.type === "folder") {
            children.push(item.id);
            dfs(item.children, callback, children);
          }
        }
        return children;
      };

      const newNode = {
        ...toCopy,
        collapsed: state.toCopy.type === "folder" ? false : undefined,
        id: state.toCopy.isCut ? toCopy.id : `${state.toCopy.type}-${uuidv4()}`,
      };

      if (state.toCopy.type === "folder" && state.toCopy.isCut !== true) {
        dfs(toCopy.children, (item) => {
          item.id = `${item.type}-${uuidv4()}`;
        });
      } else if (state.toCopy.isCut === true) {
        if (state.toCopy.type === "folder") {
          const children = dfs(toCopy.children, () => {});
          const recursiveCut = children.filter(
            (child) => child === state.contextSelected.id
          );
          if (recursiveCut.length > 0) {
            state.toCopy = { id: null, type: null, isCut: null };
            return;
          }
        }
        structureSlice.caseReducers.removeNode(state, {
          payload: { ...state.toCopy },
        });
      }

      bfsNodeAction(state.initialFolder, state.contextSelected.id, (folder) => {
        folder.collapsed = false;
        folder.children.push(newNode);
      });

      state.normalized[`${newNode.type}s`].byId[newNode.id] = newNode;
      state.normalized[`${newNode.type}s`].allIds.push(newNode.id);

      if (state.toCopy.isCut) {
        state.toCopy = { id: null, type: null, isCut: null };
      }
    },

    setSelected: (state, action) => {
      if (state.selected !== action.payload.id) {
        state.selected = action.payload.id;
      }
    },

    contextClick: (state, action) => {
      const { id, type, threeDot } = action.payload;
      // Don't run this if the user clicks on the same item
      // if (id === state.contextSelected.id) return;
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
    sortStructure: (_, action) => {
      prepareSort(action.payload, (children) => {
        children.sort((a: any, b: any) => {
          if (a.type === "folder" && b.type === "file") {
            return -1;
          } else if (a.type === "file" && b.type === "folder") {
            return 1;
          } else {
            return a.name.localeCompare(b.name);
          }
        });
      });
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

export const fileIds = (state: any) => state.structure.normalized.files.allIds;
export const folderIds = (state: any) =>
  state.structure.normalized.folders.allIds;

export const clipboard = (state: any) => state.structure.toCopy;

// export const getChildren = (state: any, action) => {
//   const { id } = action.payload;
//   const folder = state.structure.normalized.folders.byId[id];
//   return folder.children;
// };

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
