import { RootState, store } from "../state/store";
export type FileTree = {
  [key: string]: {
    id: string;
    content: string;
  };
};
export const getFiles = () => {
  const state = store.getState() as RootState;
  
  const allFileIds = state.structure.normalized.files.allIds;
  const allFilesAndPaths = allFileIds.map((id) => {
    return {
      id,
      content: state.structure.normalized.files.byId[id].content,
      path: state.editor.activeEditors.find((editor) => editor.id === id)?.path,
    };
  });
  const tree = allFilesAndPaths.reduce((acc: any, file: any) => {
    acc[`/${file.path.join("/")}`] = file.content;
    return acc;
  }, {} as FileTree);
  return tree;
};
