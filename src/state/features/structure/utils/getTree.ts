import { getPaths } from "../../editor/utils/pathUtil";
import { Normalized } from "../structureSlice";

const getTree = (allFileIds: string[], normalized: Normalized) => {
  const allFilesAndPaths = allFileIds.map((id) => {
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

export default getTree;
