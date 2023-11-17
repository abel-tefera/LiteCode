import { Directory, FileInFolder } from "../structureSlice";

const bfsNodeAction = (
  currentItem: Directory | FileInFolder,
  id: string,
  callback: (currentItem: Directory | FileInFolder) => void
) => {
  const queue: (Directory | FileInFolder)[] = [currentItem];
  while (queue.length > 0) {
    currentItem = queue.shift() as Directory | FileInFolder;
    if (currentItem.id === id) {
      return callback(currentItem);
    } else if (currentItem.type === "folder") {
      queue.push(...currentItem.subFoldersAndFiles);
    }
  }
};

const dfsNodeAction = (
  structure: Directory[],
  id: string,
  callback: (item: Directory | FileInFolder, parents: Directory[]) => void,
  parents: Directory[]
) => {
  for (let item of structure) {
    if (item.id === id) {
      return callback(item, parents);
    } else if (item.type === "folder") {
      parents.push(item);
      dfsNodeAction(
        item.subFoldersAndFiles as Directory[],
        id,
        callback,
        parents
      );
    }
  }
  parents.pop();
};

const dfsCbOnEach = (
  node: Directory[],
  callback: (item: Directory | FileInFolder, parentIds: string[]) => void,
  childrenIds: string[] = [],
  parentIds: string[]
) => {
  for (let item of node) {
    callback(item, parentIds);
    // if (item.collapsed !== undefined) {
    //   item.collapsed = true;
    // }
    if (item.type === "folder") {
      const childIds = item.subFoldersAndFiles.map(({ id }) => id);
      childrenIds.push(...childIds);
      parentIds.push(item.id);
      dfsCbOnEach(
        item.subFoldersAndFiles as Directory[],
        callback,
        childrenIds,
        parentIds
      );
      parentIds.pop();
    }
  }
  return { childrenIds, parentIds };
};

export { dfsNodeAction, bfsNodeAction, dfsCbOnEach };
