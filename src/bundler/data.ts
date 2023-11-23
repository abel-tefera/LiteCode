import { getPaths } from "../state/features/editor/utils/pathUtil";
import { ValidExtensions } from "../state/features/structure/structureSlice";
import getTree from "../state/features/structure/utils/getTree";
import { RootState, store } from "../state/store";

export type FileTree = {
  [key: string]: string;
};

export const getFiles = (): FileTree => {
  const state = store.getState() as RootState;

  const allFileIds = state.structure.normalized.files.allIds;
  const tree = getTree(allFileIds, state.structure.normalized);
  for (const key in tree) {
    const content = tree[key];
    const extension = key.split(".").reverse()[0] as ValidExtensions;
    if (
      (extension === "js" || extension === "jsx") &&
      !content.includes("import React")
    ) {
      tree[key] = `import React from 'react';\n${content}`;
    }
  }
  return tree;
};
