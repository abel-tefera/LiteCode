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
      queue.push(...currentItem.childrenIdsAndType);
    }
  }
};

const dfsNodeAction = (
  structure: Directory[],
  id: string,
  callback: (item: Directory, parent: Directory) => void,
  parent: Directory[]
) => {
  for (let item of structure) {
    if (item.id === id) {
      return callback(item, parent[parent.length - 1]);
    } else if (item.type === "folder") {
      parent.push(item);
      dfsNodeAction(
        item.childrenIdsAndType as Directory[],
        id,
        callback,
        parent
      );
    }
  }
  parent.pop();
};

export { dfsNodeAction, bfsNodeAction };
