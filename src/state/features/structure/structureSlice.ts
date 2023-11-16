import { createDraftSafeSelector, createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../../store";
import { v4 as uuidv4 } from "uuid";
import { bfsNodeAction, dfsNodeAction } from "./utils/traversal";
import { findSortable } from "./utils/sorting";

// type NestedRecord<T extends any[]>
//     = T extends [any, ...infer R]
//     ? Record<string, NestedRecord<R>>
//     : string

export type ItemType = "file" | "folder";

export type ValidExtensions = "js" | "jsx" | "css" | "md" | "ts" | "tsx";

export const validExtensions = ["js", "jsx", "css", "md", "ts", "tsx"];
export type FileStructure = {
  id: string;
  name: string;
  type: "file";
  content: string;
  extension: ValidExtensions;
};

export type NormalizedFolder = {
  id: string;
  name: string;
  type: "folder";
  collapsed: boolean;
  childrenFlat: Identifier[];
  // childrenIdsAndType: FileStructure[] | FolderStructure[];
};

type FileOrFolder = {
  id: string;
  name: string;
  type: ItemType;
  collapsed?: boolean;
  childrenFlat?: Identifier[];
  content?: string;
  extension?: ValidExtensions;
};

type Identifier = {
  id: string;
  type: ItemType;
};

export type FileInFolder = {
  id: string;
  type: "file";
  childrenIdsAndType: null;
};

export type Directory = {
  id: string;
  type: "folder";
  childrenIdsAndType: (Directory | FileInFolder)[];
};

export type Normalized = {
  folders: {
    byId: { [key: string]: NormalizedFolder };
    allIds: string[];
  };
  files: {
    byId: { [key: string]: FileStructure };
    allIds: string[];
  };
};

type ContextSelected = {
  id: string;
  type: ItemType;
  e:
    | {
        x: number;
        y: number;
      }
    | false;
};

type ToCopy = {
  id: string;
  type: ItemType;
  childrenIdsAndType: Directory[];
  isCut: boolean;
  parentId: string;
} | null;

interface FileSystem {
  normalized: Normalized;
  selected: string;
  contextSelected: ContextSelected;
  toCopy: ToCopy;
  parentItemId: string;
  initialFolder: Directory;
  // tabs: Tabs;
}

const initialState: FileSystem = {
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
    type: "folder",
    childrenIdsAndType: [],
  },
  selected: "head",
  contextSelected: {
    id: "head",
    type: "folder",
    e: false,
  },
  toCopy: null,
  parentItemId: "head",
  // tabs: [],
};

export const structureSlice = createSlice({
  name: "structure",
  initialState,
  reducers: {
    addNode: (
      state,
      action: PayloadAction<{ value: string; inputType: ItemType }>
    ) => {
      // if (!state.contextSelected) return;
      const { value, inputType } = action.payload;
      let newName = value;
      let newExtension = "";
      if (inputType === "file") {
        newName = value.substring(0, value.lastIndexOf("."));
        newExtension = value.substring(value.lastIndexOf(".") + 1);
      }

      const newChild: FileOrFolder = {
        id: `${inputType}-${uuidv4()}`,
        name: newName,
        type: inputType,
        extension:
          inputType === "file" ? (newExtension as ValidExtensions) : undefined,
        collapsed: inputType === "folder" ? true : undefined,
        childrenFlat: inputType === "folder" ? [] : undefined,
        content: inputType === "file" ? "" : undefined,
      };
      if (state.contextSelected.id === state.initialFolder.id) {
        state.initialFolder.childrenIdsAndType = [
          ...state.initialFolder.childrenIdsAndType,
          {
            id: newChild.id,
            type: newChild.type,
            childrenIdsAndType: newChild.type === "folder" ? [] : null,
          } as Directory,
        ];
        state.normalized.folders.byId[state.initialFolder.id].childrenFlat = [
          ...state.normalized.folders.byId[state.initialFolder.id].childrenFlat,
          { id: newChild.id, type: newChild.type },
        ];
      } else {
        bfsNodeAction(state.initialFolder, state.contextSelected.id, (item) => {
          state.normalized.folders.byId[state.contextSelected.id].childrenFlat =
            [
              ...state.normalized.folders.byId[state.contextSelected.id]
                .childrenFlat,
              { id: newChild.id, type: newChild.type },
            ];

          item.childrenIdsAndType = [
            ...(item.childrenIdsAndType as Directory[]),
            {
              id: newChild.id,
              type: newChild.type,
              childrenIdsAndType: newChild.type === "folder" ? [] : null,
            } as Directory,
          ];
        });
      }
      const inputTypeForFetch =
        `${inputType}s` as keyof typeof state.normalized;
      state.normalized[inputTypeForFetch].byId[newChild.id] = newChild as
        | FileStructure
        | NormalizedFolder;
      state.normalized[inputTypeForFetch].allIds = [
        ...state.normalized[inputTypeForFetch].allIds,
        newChild.id,
      ];

      structureSlice.caseReducers.sortStructure(state, {
        payload: { id: state.contextSelected.id },
        type: "",
      });
    },

    removeNode: (
      state,
      action: PayloadAction<
        { id: string; type: ItemType } | { id: null; type: null }
      >
    ) => {
      const id = action.payload.id
        ? action.payload.id
        : state.contextSelected?.id;
      const type = action.payload.type
        ? action.payload.type
        : state.contextSelected?.type;
      if (id === state.initialFolder.id) return;
      dfsNodeAction(
        state.initialFolder.childrenIdsAndType as Directory[],
        id as string,
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

          const deleteNodes = (subItems: (Directory | FileInFolder)[]) => {
            for (let item of subItems) {
              const { id, type } = item;
              // state.normalized[type + "s"].byId[id] = undefined;
              state.normalized[
                (type + "s") as keyof typeof state.normalized
              ].allIds = state.normalized[
                (type + "s") as keyof typeof state.normalized
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
          }
        },
        [state.initialFolder]
      );

      // state.normalized[type + "s"].byId[id] = undefined;
      state.normalized[(type + "s") as keyof typeof state.normalized].allIds =
        state.normalized[
          (type + "s") as keyof typeof state.normalized
        ].allIds.filter((_id) => _id !== id);

      // remove Tab
      // state.tabs = state.tabs.filter(
      //   (tab) =>
      //     state.normalized.files.allIds.find((id) => id === tab.id) !==
      //     undefined
      // );
    },

    renameNode: (state, action: PayloadAction<{ value: string }>) => {
      let parentId = "";
      let newName = action.payload.value;
      let newExtension = "";
      if (state.contextSelected.type === "file") {
        newName = action.payload.value.substring(
          0,
          action.payload.value.lastIndexOf(".")
        );
        newExtension = action.payload.value.substring(
          action.payload.value.lastIndexOf(".") + 1
        );
      }
      dfsNodeAction(
        state.initialFolder.childrenIdsAndType as Directory[],
        state.contextSelected.id,
        (_, parent) => {
          // item.name = action.payload.value;
          parentId = parent.id;
          return;
        },
        [state.initialFolder]
      );
      state.normalized[
        (state.contextSelected.type + "s") as keyof typeof state.normalized
      ].byId[state.contextSelected.id].name = newName;

      if (state.contextSelected.type === "file") {
        state.normalized.files.byId[state.contextSelected.id].extension =
          newExtension as ValidExtensions;
      }

      structureSlice.caseReducers.sortStructure(state, {
        payload: { id: parentId },
        type: "",
      });
      // update tab
      // state.tabs = state.tabs.map((tab) => {
      //   if (
      //     state.normalized.files.allIds.find((id) => id === tab.id) !==
      //     undefined
      //   ) {
      //     return {
      //       ...tab,
      //       extension: newExtension as ValidExtensions,
      //     };
      //   }
      //   return tab;
      // });
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

    collapseOrExpand: (
      state,
      action: PayloadAction<{ item: Identifier; collapse: boolean }>
    ) => {
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
          // state.selected = item.id;
          // state.contextSelected.id = null;
        }
        if (collapse) {
          state.normalized.folders.byId[item.id].collapsed =
            !state.normalized.folders.byId[item.id].collapsed;
        } else {
          state.normalized.folders.byId[item.id].collapsed = false;
        }
      } else if (action.payload.item.type === "file") {
        // state.contextSelected.id = null;
      }
      // state.selected = action.payload.item.id;
    },

    copyNode: (state) => {
      if (!state.toCopy) return;
      const dfs = (
        node: Directory[],
        callback: (item: Directory, parentId: string) => void,
        childrenIds: string[] = [],
        parentIds: string[] = ["head"]
      ) => {
        for (let item of node) {
          callback(item, parentIds[parentIds.length - 1]);
          // if (item.collapsed !== undefined) {
          //   item.collapsed = true;
          // }
          if (item.type === "folder") {
            const childIds = item.childrenIdsAndType.map(({ id }) => id);
            childrenIds.push(...childIds);
            parentIds.push(item.id);
            dfs(
              item.childrenIdsAndType as Directory[],
              callback,
              childrenIds,
              parentIds
            );
            parentIds.pop();
          }
        }
        return childrenIds;
      };

      if (state.toCopy.isCut === true) {
        if (state.toCopy.type === "folder") {
          const children = dfs(
            state.toCopy.childrenIdsAndType,
            () => {},
            state.toCopy.childrenIdsAndType.map(({ id }) => id)
          );
          const recursiveCut = children.filter(
            (id) => id === state.contextSelected.id
          );
          if (
            recursiveCut.length > 0 ||
            state.toCopy.id === state.contextSelected.id
          ) {
            state.toCopy = null;
            return;
          }
        } else {
          const sameCut = state.normalized.folders.byId[
            state.contextSelected.id
          ].childrenFlat.find(({ id }) => id === state.toCopy?.id);
          if (sameCut) {
            state.toCopy = null;
            return;
          }
        }
      }
      const item =
        state.normalized[
          (state.toCopy.type + "s") as keyof typeof state.normalized
        ].byId[state.toCopy.id];
      const toCopyItem = {
        ...item,
        childrenIdsAndType: state.toCopy.childrenIdsAndType,
        // childrenIdsAndType: state.toCopy.childrenIdsAndType
        //   ? state.toCopy.childrenIdsAndType
        //   : undefined,
        id: `${state.toCopy.type}-${uuidv4()}`,
        wholeName:
          item.type === "file" ? `${item.name}.${item.extension}` : item.name,
      };

      const knownNames = state.normalized.folders.byId[
        `${state.contextSelected.id}`
      ].childrenFlat.map(({ id, type }) => {
        if (type === "folder") {
          return state.normalized[`${type}s`].byId[id].name;
        } else {
          const file = state.normalized[`${type}s`].byId[id];
          return `${file.name}.${file.extension}`;
        }
      });
      let newName = toCopyItem.wholeName;
      const isNameTaken =
        knownNames.filter((knownName) => knownName === toCopyItem.wholeName)
          .length > 0;
      if (isNameTaken) {
        let i = 1;
        while (
          knownNames.filter((knownName) => {
            if (toCopyItem.type === "file") {
              return (
                knownName ===
                `${toCopyItem.name} - Copy (${i}).${toCopyItem.extension}`
              );
            } else {
              return knownName === `${toCopyItem.name} - Copy (${i})`;
            }
          }).length > 0
        ) {
          i++;
        }
        newName =
          toCopyItem.type === "folder"
            ? `${toCopyItem.name} - Copy (${i})`
            : `${toCopyItem.name} - Copy (${i}).${toCopyItem.extension}`;
        toCopyItem.wholeName = newName;
      }

      const newNode = {
        ...toCopyItem,
        name:
          toCopyItem.type === "file"
            ? newName.substring(0, newName.lastIndexOf("."))
            : newName,
        extension:
          toCopyItem.type === "file" ? newName.split(".").pop() : undefined,
        // childrenIdsAndType: state.toCopy.type === "folder" ? [] : null,
        collapsed: state.toCopy.type === "folder" ? false : undefined,
      };
      state.normalized.folders.byId[state.contextSelected.id].collapsed = false;
      state.normalized.folders.byId[state.contextSelected.id].childrenFlat = [
        ...state.normalized.folders.byId[state.contextSelected.id].childrenFlat,
        { id: newNode.id, type: newNode.type },
      ];

      if (newNode.type === "folder") {
        state.normalized.folders.byId[newNode.id] = {
          id: newNode.id,
          name: newNode.name,
          type: "folder",
          collapsed: false,
          childrenFlat: newNode.childrenFlat,
        };
      } else {
        state.normalized.files.byId[newNode.id] = {
          id: newNode.id,
          name: newNode.name,
          type: "file",
          extension: newNode.extension as ValidExtensions,
          content: newNode.content,
        };
      }
      // state.normalized[`${newNode.type}s`].byId[newNode.id] = {
      //   ...newNode,
      //   childrenIdsAndType: null,
      // };
      state.normalized[`${newNode.type}s`].allIds = [
        ...state.normalized[`${newNode.type}s`].allIds,
        newNode.id,
      ];

      const actionOnChildren = (newNode: Directory) => {
        if (state.toCopy?.type === "folder") {
          dfs(
            newNode.childrenIdsAndType as Directory[],
            (item, parentId) => {
              const newItem = {
                ...state.normalized[`${item.type}s`].byId[item.id],
              };
              newItem.id = `${newItem.type}-${uuidv4()}`;
              state.normalized[`${newItem.type}s`].byId[newItem.id] = newItem;
              state.normalized[`${newItem.type}s`].allIds = [
                ...state.normalized[`${newItem.type}s`].allIds,
                newItem.id,
              ];
              state.normalized.folders.byId[parentId].childrenFlat =
                state.normalized.folders.byId[parentId].childrenFlat.map(
                  (existingItem) => {
                    if (existingItem.id === item.id) {
                      return { ...existingItem, id: newItem.id };
                    } else {
                      return existingItem;
                    }
                  }
                );
              item.id = newItem.id;
            },
            [],
            [newNode.id]
          );
        }
        return newNode;
      };

      if (state.contextSelected.id === state.initialFolder.id) {
        const node = actionOnChildren(newNode as Directory);
        state.initialFolder.childrenIdsAndType = [
          ...state.initialFolder.childrenIdsAndType,
          {
            id: node.id,
            type: node.type,
            childrenIdsAndType:
              node.type === "folder" ? node.childrenIdsAndType : null,
          } as Directory,
        ];
      } else {
        dfsNodeAction(
          state.initialFolder.childrenIdsAndType as Directory[],
          state.contextSelected.id,
          (parent) => {
            const node = actionOnChildren(newNode as Directory);
            parent.childrenIdsAndType = [
              ...parent.childrenIdsAndType,
              {
                id: node.id,
                type: node.type,
                childrenIdsAndType: node.childrenIdsAndType,
              },
            ];
          },
          [state.initialFolder]
        );
      }

      if (state.toCopy.isCut === true) {
        structureSlice.caseReducers.removeNode(state, {
          payload: { id: state.toCopy.id, type: state.toCopy.type },
          type: "",
        });
      }

      // else {
      //   state.initialFolder.childrenIdsAndType = [
      //     ...state.initialFolder.childrenIdsAndType,
      //     {
      //       id: newNode.id,
      //       type: newNode.type,
      //       childrenIdsAndType:
      //         newNode.type === "folder"
      //           ? state.toCopy.childrenIdsAndType
      //           : null,
      //     },
      //   ];
      // }

      structureSlice.caseReducers.sortStructure(state, {
        payload: { id: state.contextSelected.id },
        type: "",
      });

      if (state.toCopy.isCut) {
        state.toCopy = null;
      }
    },

    setSelected: (
      state,
      action: PayloadAction<{
        id: string;
        type: ItemType;
      }>
    ) => {
      const item =
        state.normalized[
          `${action.payload.type}s` as keyof typeof state.normalized
        ].byId[action.payload.id];
      if (state.selected !== item.id) {
        if (item.id === "head") {
          state.contextSelected = { id: "head", type: "folder", e: false };
        }
        state.selected = action.payload.id;
      }
    },

    contextClick: (
      state,
      action: PayloadAction<{
        id: string;
        type: string;
        threeDot:
          | {
              x: number;
              y: number;
            }
          | false;
      }>
    ) => {
      const { id, type, threeDot } = action.payload;
      // Don't run this if the user clicks on the same item
      // if (id === state.contextSelected.id) return;
      const newContext = {
        id: "",
        type: "",
        e: threeDot
          ? {
              x: threeDot.x,
              y: threeDot.y,
            }
          : false,
      };
      if (id !== null) {
        newContext.id = id;
        newContext.type = type;
        if (threeDot) {
          newContext.e = threeDot;
        }
      } else {
        newContext.id = state.initialFolder.id;
        newContext.type = "folder";

        if (threeDot) {
          newContext.e = threeDot;
        }
      }

      state.contextSelected = newContext as ContextSelected;
    },
    setToCopy: (
      state,
      action: PayloadAction<{
        id: string;
        type: ItemType;
        isCut: boolean;
      }>
    ) => {
      const children: Directory[] = [];

      const newCopy = {
        id: action.payload.id,
        type: action.payload.type,
        isCut: action.payload.isCut,
        parentId: "",
        childrenIdsAndType: children,
      };

      if (newCopy.type === "folder") {
        dfsNodeAction(
          state.initialFolder.childrenIdsAndType as Directory[],
          action.payload.id,
          (toCopyFolder, parent) => {
            newCopy.childrenIdsAndType =
              toCopyFolder.childrenIdsAndType as Directory[];
            newCopy.parentId = parent.id;
          },
          [state.initialFolder]
        );
      }

      state.toCopy = newCopy;
    },
    setParentItemId: (state, action: PayloadAction<string>) => {
      if (action.payload !== "") {
        state.parentItemId = action.payload;
      } else {
        let parentId = "";
        dfsNodeAction(
          state.initialFolder.childrenIdsAndType as Directory[],
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
    sortStructure: (state, action: PayloadAction<{ id: string }>) => {
      findSortable(
        state.initialFolder,
        (structure: Directory) => {
          if (action.payload.id !== null && action.payload.id !== structure.id)
            return;
          if (
            action.payload.id === null ||
            structure.id === action.payload.id
          ) {
            const toSort = structure.childrenIdsAndType.map(
              (item: Directory | FileInFolder) => {
                return state.normalized[`${item.type}s`].byId[item.id];
              }
            );
            toSort.sort(
              (
                a: FileStructure | NormalizedFolder,
                b: FileStructure | NormalizedFolder
              ) => {
                if (a.type === "folder" && b.type === "file") {
                  return -1;
                } else if (a.type === "file" && b.type === "folder") {
                  return 1;
                } else {
                  return a.name.localeCompare(b.name);
                }
              }
            );

            structure.childrenIdsAndType = toSort.map(
              ({ id, type }: FileStructure | NormalizedFolder) => {
                const childrenIdsAndType = structure.childrenIdsAndType.find(
                  ({ id: _id }) => _id === id
                )?.childrenIdsAndType;
                return { id, type, childrenIdsAndType };
              }
            ) as Directory[];
          }
        },
        action.payload.id
      );
    },
  },
});

export const getInitialSet = (state: RootState) =>
  state.structure.initialFolder.childrenIdsAndType;

export const selectedItem = (state: RootState) => state.structure.selected;
export const contextSelectedEvent = (state: RootState) =>
  state.structure.contextSelected?.e;

export const contextSelectedItem = (state: RootState) =>
  state.structure.contextSelected?.id;

export const contextSelectedItemType = (state: RootState) =>
  state.structure.contextSelected?.type;

export const fileIds = (state: RootState) =>
  state.structure.normalized.files.allIds;
export const folderIds = (state: RootState) =>
  state.structure.normalized.folders.allIds;

export const clipboard = (state: RootState) => state.structure.toCopy;

// export const getChildren = (state: any, action) => {
//   const { id } = action.payload;
//   const folder = state.structure.normalized.folders.byId[id];
//   return folder.children;
// };

export const getItem = (state: RootState) => {
  if (!state.structure.contextSelected)
    return { id: undefined, name: undefined };
  const item =
    state.structure.normalized[`${state.structure.contextSelected.type}s`].byId[
      state.structure.contextSelected.id
    ];
  if (item.type === "file") {
    return {
      id: item.id,
      name: item.name,
      type: item.type,
      extension: item.extension,
    };
  } else {
    return {
      id: item.id,
      name: item.name,
      type: item.type,
    };
  }
};

export const getCurrentItems = (state: RootState) => {
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
