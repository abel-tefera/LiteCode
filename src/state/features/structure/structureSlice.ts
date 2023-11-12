// @ts-nocheck
import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../../store";
import { v4 as uuidv4 } from "uuid";
import { bfsNodeAction, dfsNodeAction } from "./utils/traversal";
import { findSortable } from "./utils/sorting";

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
      byId: {
        head: {
          id: "head",
          name: "head",
          type: "folder",
          collapsed: false,
          childrenFlat: [],
        },
      },
      allIds: ["head"],
    },
  },
  initialFolder: {
    id: "head",
    name: "head",
    type: "folder",
    collapsed: false,
    childrenIdsAndType: [],
    // children: [
    //   {
    //     id: "folder1Id",
    //     name: "Folder 1",
    //     children: [
    //       {
    //         id: "folder2Id",
    //         name: "Folder 2",
    //         children: [
    //           {
    //             id: "folder3Id",
    //             name: "Folder 3",
    //             type: "folder",
    //             collapsed: true,
    //             children: [],
    //           },
    //           {
    //             id: "file1Id",
    //             name: "File1.js",
    //             type: "file",
    //             extension: "js",
    //           },
    //         ],
    //         type: "folder",
    //         collapsed: true,
    //       },
    //       {
    //         id: "folder4Id",
    //         name: "Folder 4",
    //         type: "folder",
    //         collapsed: false,
    //         children: [
    //           {
    //             id: "folder5Id",
    //             name: "Folder 5",
    //             type: "folder",
    //             collapsed: true,
    //             children: [],
    //           },
    //           {
    //             id: "f21ile2Id",
    //             name: "a.js",
    //             type: "file",
    //             extension: "js",
    //           },
    //           {
    //             id: "fi3le2Id",
    //             name: "z.js",
    //             type: "file",
    //             extension: "js",
    //           },
    //           {
    //             id: "fil1e2Id",
    //             name: "b.js",
    //             type: "file",
    //             extension: "js",
    //           },
    //         ],
    //       },
    //     ],
    //     type: "folder",
    //     collapsed: false,
    //   },
    // ],
  },
  selected: "head",
  contextSelected: {
    id: null,
    type: null,
    e: null,
  },
  toCopy: { id: null, type: null, childrenIdsAndType: null, isCut: null },
  parentItemId: null,
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
        childrenFlat: inputType === "folder" ? [] : undefined,
      };
      if (state.contextSelected.id === "head") {
        state.initialFolder.childrenIdsAndType = [
          ...state.initialFolder.childrenIdsAndType,
          {
            id: newChild.id,
            type: newChild.type,
            childrenIdsAndType: newChild.type === "folder" ? [] : null,
          },
        ];
        state.normalized.folders.byId["head"].childrenFlat = [
          ...state.normalized.folders.byId["head"].childrenFlat,
          { id: newChild.id, type: newChild.type },
        ];
      } else if (state.contextSelected.id !== null) {
        bfsNodeAction(state.initialFolder, state.contextSelected.id, (item) => {
          state.normalized.folders.byId[state.contextSelected.id].childrenFlat =
            [
              ...state.normalized.folders.byId[state.contextSelected.id]
                .childrenFlat,
              { id: newChild.id, type: newChild.type },
            ];

          item.childrenIdsAndType = [
            ...item.childrenIdsAndType,
            {
              id: newChild.id,
              type: newChild.type,
              childrenIdsAndType: newChild.type === "folder" ? [] : null,
            },
          ];
        });
      }
      state.normalized[inputType + "s"].byId[newChild.id] = newChild;
      state.normalized[inputType + "s"].allIds = [
        ...state.normalized[inputType + "s"].allIds,
        newChild.id,
      ];

      structureSlice.caseReducers.sortStructure(state, {
        payload: { id: state.contextSelected.id },
      });
    },

    removeNode: (state, action) => {
      const id = action.payload.id
        ? action.payload.id
        : state.contextSelected.id;
      const type = action.payload.type
        ? action.payload.type
        : state.contextSelected.type;
      dfsNodeAction(
        state.initialFolder.childrenIdsAndType,
        id,
        (item, parent) => {
          parent.childrenIdsAndType = parent.childrenIdsAndType.filter(
            ({ id }) => {
              return id !== item.id;
            }
          );
          const parentId = parent.id;
          state.normalized.folders.byId[parentId].childrenFlat =
            state.normalized.folders.byId[parentId].childrenFlat.filter(
              ({ id: _id }) => _id !== item.id
            );

          const deleteNodes = (subItems) => {
            for (let item of subItems) {
              const { id, type } = item;
              // state.normalized[type + "s"].byId[id] = undefined;
              state.normalized[type + "s"].allIds = state.normalized[
                type + "s"
              ].allIds.filter((_id) => _id !== id);
              if (item.type === "folder") {
                deleteNodes(item.childrenIdsAndType);
              }
            }
          };
          if (item.type === "folder") {
            deleteNodes(item.childrenIdsAndType);
          }

          if (parent.childrenIdsAndType.length === 0) {
            state.normalized.folders.byId[parentId].collapsed = true;
            parent.collapsed = true;
          }
        },
        [state.initialFolder]
      );

      // state.normalized[type + "s"].byId[id] = undefined;
      state.normalized[type + "s"].allIds = state.normalized[
        type + "s"
      ].allIds.filter((_id) => _id !== id);
    },

    renameNode: (state, action) => {
      let parentId = null;
      dfsNodeAction(
        state.initialFolder.childrenIdsAndType,
        state.contextSelected.id,
        (_, parent) => {
          // item.name = action.payload.value;
          parentId = parent.id;
          return;
        },
        [state.initialFolder]
      );
      state.normalized[state.contextSelected.type + "s"].byId[
        state.contextSelected.id
      ].name = action.payload.value;

      if (state.contextSelected.type === "file") {
        state.normalized[state.contextSelected.type + "s"].byId[
          state.contextSelected.id
        ].extension = action.payload.value.split(".").reverse()[0];
      }

      structureSlice.caseReducers.sortStructure(state, {
        payload: { id: parentId },
      });
    },

    // normalizeState: (state) => {
    //   state.normalized.folders.byId["head"] = {
    //     ...state.initialFolder,
    //     childrenIds: undefined,
    //     childrenFlat: [],
    //   };
    //   state.normalized.folders.allIds = ["head"];

    //   const mapStructureRecursively = (structure: any, normalized: any) => {
    //     for (let item of structure) {
    //       if (item.type === "folder") {
    //         normalized.folders.byId[item.id] = {
    //           ...item,
    //           childrenIds: undefined,
    //           childrenFlat: item.children.map((child) => {
    //             return { id: child.id, name: child.name, type: child.type };
    //           }),
    //         };
    //         normalized.folders.allIds = [...normalized.folders.allIds, item.id];
    //         mapStructureRecursively(item.children, normalized);
    //       } else if (item.type === "file") {
    //         normalized.files.byId[item.id] = item;
    //         normalized.files.allIds = [...normalized.files.allIds, item.id];
    //       }
    //     }
    //   };
    //   mapStructureRecursively(state.initialFolder.children, state.normalized);
    //   structureSlice.caseReducers.sortStructure(state, {
    //     payload: { id: null },
    //   });
    // },

    collapseOrExpand: (state, action) => {
      if (action.payload.item.type === "folder") {
        const { item, collapse } = action.payload;
        // bfsNodeAction(state.initialFolder, item.id, (folder) => {
        //   if (collapse) {
        //     folder.collapsed = !folder.collapsed;
        //   } else {
        //     folder.collapsed = false;
        //   }
        // });
        if (collapse) {
          state.selected = item.id;
          // state.contextSelected.id = null;
        }
        if (collapse) {
          state.normalized.folders.byId[item.id].collapsed =
            !state.normalized.folders.byId[item.id].collapsed;
        } else {
          state.normalized.folders.byId[item.id].collapsed = false;
        }
      } else if (action.payload.item.type === "file") {
        state.selected = action.payload.item.id;
        // state.contextSelected.id = null;
      }
    },

    copyNode: (state) => {
      const dfs = (node: any, callback: any, childrenIds: any[] = []) => {
        if (childrenIds.length === 0) {
          childrenIds = node.map(({ id }) => id);
        }
        for (let item of node) {
          callback(item);
          if (item.collapsed !== undefined) {
            item.collapsed = true;
          }
          const childIds = item.childrenIdsAndType.map(({ id }) => id);
          childrenIds.push(...childIds);
          if (item.type === "folder") {
            dfs(item.childrenIdsAndType, callback, childrenIds);
          }
        }
        return childrenIds;
      };

      if (state.toCopy.isCut === true) {
        if (state.toCopy.type === "folder") {
          const children = dfs(state.toCopy.childrenIdsAndType, () => {});
          const recursiveCut = children.filter(
            (id) => id === state.contextSelected.id
          );
          if (
            recursiveCut.length > 0 ||
            state.toCopy.id === state.contextSelected.id
          ) {
            state.toCopy = {
              id: null,
              type: null,
              childrenIdsAndType: null,
              isCut: null,
            };
            return;
          }
        } else {
          const sameCut = state.normalized.folders.byId[
            state.contextSelected.id
          ].childrenFlat.find(({ id }) => id === state.toCopy.id);
          if (sameCut) {
            state.toCopy = {
              id: null,
              type: null,
              childrenIdsAndType: null,
              isCut: null,
            };
            return;
          }
        }
      }
      const toCopyItem = {
        ...state.normalized[state.toCopy.type + "s"].byId[state.toCopy.id],
        // childrenIdsAndType: state.toCopy.childrenIdsAndType
        //   ? state.toCopy.childrenIdsAndType
        //   : undefined,
        id: `${state.toCopy.type}-${uuidv4()}`,
      };

      const knownNames = state.normalized.folders.byId[
        `${state.contextSelected.id}`
      ].childrenFlat.map(({ id, type }) => {
        return state.normalized[`${type}s`].byId[id].name;
      });
      let newName = toCopyItem.name;

      const isNameTaken =
        knownNames.filter((knownName) => knownName === toCopyItem.name).length >
        0;
      if (isNameTaken) {
        let i = 1;
        while (
          knownNames.filter(
            (knownName) => knownName === `${toCopyItem.name} - Copy (${i})`
          ).length > 0
        ) {
          i++;
        }
        if (state.toCopy.type === "folder") {
          newName = `${toCopyItem.name} - Copy (${i})`;
        } else if (state.toCopy.type === "file") {
          newName = `${toCopyItem.name.split(".")[0]} - Copy (${i}).${
            toCopyItem.name.split(".")[1]
          }`;
        }
      }

      const newNode = {
        ...toCopyItem,
        name: newName,
        // name: toCopyItem.name + " - Copy",
        childrenIdsAndType: state.toCopy.type === "folder" ? [] : null,
        collapsed: state.toCopy.type === "folder" ? false : undefined,
      };

      if (state.toCopy.type === "folder") {
        let copyOftoCopy;
        dfs(state.toCopy.childrenIdsAndType, (item) => {
          copyOftoCopy = { ...state.normalized[`${item.type}s`].byId[item.id] };
          copyOftoCopy.id = `${item.type}-${uuidv4()}`;
          state.normalized[`${item.type}s`].byId[item.id] = copyOftoCopy;
          state.normalized[`${item.type}s`].allIds = [
            ...state.normalized[`${item.type}s`].allIds,
            copyOftoCopy.id,
          ];
        });
      }

      if (state.toCopy.isCut === true) {
        structureSlice.caseReducers.removeNode(state, {
          payload: { ...state.toCopy },
        });
      }

      if (state.contextSelected.id !== "head") {
        dfsNodeAction(
          state.initialFolder.childrenIdsAndType,
          state.contextSelected.id,
          (parent) => {
            parent.childrenIdsAndType = [
              ...parent.childrenIdsAndType,
              {
                id: newNode.id,
                type: newNode.type,
                childrenIdsAndType:
                  newNode.type === "folder"
                    ? state.toCopy.childrenIdsAndType
                    : null,
              },
            ];
          },
          [state.initialFolder]
        );
      } else {
        state.initialFolder.childrenIdsAndType = [
          ...state.initialFolder.childrenIdsAndType,
          {
            id: newNode.id,
            type: newNode.type,
            childrenIdsAndType:
              newNode.type === "folder"
                ? state.toCopy.childrenIdsAndType
                : null,
          },
        ];
      }

      state.normalized.folders.byId[state.contextSelected.id].collapsed = false;
      state.normalized.folders.byId[state.contextSelected.id].childrenFlat = [
        ...state.normalized.folders.byId[state.contextSelected.id].childrenFlat,
        { id: newNode.id, type: newNode.type },
      ];
      state.normalized[`${newNode.type}s`].byId[newNode.id] = newNode;
      state.normalized[`${newNode.type}s`].allIds = [
        ...state.normalized[`${newNode.type}s`].allIds,
        newNode.id,
      ];

      structureSlice.caseReducers.sortStructure(state, {
        payload: { id: state.contextSelected.id },
      });

      if (state.toCopy.isCut) {
        state.toCopy = {
          id: null,
          type: null,
          childrenIdsAndType: null,
          isCut: null,
        };
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
      let parentId = null;
      state.toCopy.id = action.payload.id;
      state.toCopy.type = action.payload.type;
      // dfs action to get all children ids
      let childrenIds = [];

      dfsNodeAction(
        state.initialFolder.childrenIdsAndType,
        action.payload.id,
        (toCopyFolder, parent) => {
          // item.name = action.payload.value;
          childrenIds = toCopyFolder.childrenIdsAndType;
          parentId = parent.id;
        },
        [state.initialFolder]
      );
      if (action.payload.type === "folder") {
        state.toCopy.childrenIdsAndType = childrenIds;
      } else {
        state.toCopy.childrenIdsAndType = undefined;
      }
      state.toCopy.parentId = parentId;

      // state.toCopy.childrenIds =
      //   state.normalized[`${action.payload.type}s`].byId[
      //     action.payload.id
      //   ].childrenIdsAndType;
      state.toCopy.isCut = action.payload.isCut;
    },
    setParentItemId: (state, action) => {
      if (action.payload !== null) {
        state.parentItemId = action.payload;
      } else {
        let parentId = null;
        dfsNodeAction(
          state.initialFolder.childrenIdsAndType,
          state.contextSelected.id,
          (_, parent) => {
            parentId = parent.id;
            return;
          },
          [state.initialFolder]
        );
        state.parentItemId = parentId;
      }
    },
    sortStructure: (state, action) => {
      findSortable(
        state.initialFolder,
        (structure) => {
          if (action.payload.id !== null && action.payload.id !== structure.id)
            return;
          if (
            action.payload.id === null ||
            structure.id === action.payload.id
          ) {
            const toSort = structure.childrenIdsAndType.map(
              ({ id, type, childrenIdsAndType }) => {
                return {
                  ...state.normalized[`${type}s`].byId[id],
                  childrenIdsAndType,
                };
              }
            );
            toSort.sort((a: any, b: any) => {
              if (a.type === "folder" && b.type === "file") {
                return -1;
              } else if (a.type === "file" && b.type === "folder") {
                return 1;
              } else {
                return a.name.localeCompare(b.name);
              }
            });
            structure.childrenIdsAndType = toSort.map(
              ({ id, type, childrenIdsAndType }) => {
                return { id, type, childrenIdsAndType };
              }
            );
          }
        },
        action.payload.id
      );
    },
  },
});

export const getInitialSet = (state: any) =>
  state.structure.initialFolder.childrenIdsAndType;

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

export const getCurrentItems = (state) => {
  if (!state.structure.normalized || !state.structure.parentItemId) return [];
  return state.structure.normalized.folders.byId[
    `${state.structure.parentItemId}`
  ].childrenFlat.map(({ id, type }) => {
    return state.structure.normalized[`${type}s`].byId[id];
  });
};

export const {
  addNode,
  removeNode,
  renameNode,
  collapseOrExpand,
  // normalizeState,
  setSelected,
  contextClick,
  setToCopy,
  copyNode,
  setParentItemId,
} = structureSlice.actions;

export default structureSlice.reducer;
