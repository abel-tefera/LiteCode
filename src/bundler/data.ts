import { type ValidExtensions } from "../state/features/structure/structureSlice";
import getTree from "../state/features/structure/utils/getTree";
import { store } from "../state/store";

export type FileTree = Record<string, string>;

export const getFiles = (): FileTree => {
  const state = store.getState();

  const allFileIds = state.structure.normalized.files.allIds;
  const tree = getTree(allFileIds, state.structure.normalized);
  for (const key in tree) {
    const content = tree[key];
    const extension = key.split(".").reverse()[0] as ValidExtensions;
    if (
      extension === "jsx" &&
      !(content.includes("import React") || content.includes("import react"))
    ) {
      tree[key] = `import React from 'react';\n${content}`;
    }
  }
  return tree;
};
