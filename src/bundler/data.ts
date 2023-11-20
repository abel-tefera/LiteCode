import { getPaths } from "../state/features/editor/utils/pathUtil";
import { RootState, store } from "../state/store";

export type FileTree = {
  [key: string]: string;
};

export const getFiles = (): FileTree => {
  const state = store.getState() as RootState;

  const allFileIds = state.structure.normalized.files.allIds;
  const allFilesAndPaths = allFileIds.map((id) => {
    const normalized = state.structure.normalized;
    const file = normalized.files.byId[id];
    const [_, actualPath] = getPaths(file, normalized);
    return {
      id,
      content: normalized.files.byId[id].content,
      path: actualPath,
    };
  });
  const tree = allFilesAndPaths.reduce(
    (
      acc,
      file: {
        id: string;
        content: string;
        path: string[] | undefined;
      }
    ) => {
      if (file.path) {
        const key = `/${file.path?.join("/")}`;
        acc[key] = file.content;
      }
      return acc;
    },
    {} as { [FileTreeKey: string]: string }
  );
  return tree;
};
