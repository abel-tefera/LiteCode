const bfsNodeAction = (currentItem: any, id: any, callback: any) => {
  const list = [];
  const queue = [];
  queue.push(currentItem);
  while (queue.length > 0) {
    currentItem = queue.shift();
    list.push(currentItem.name);
    if (currentItem.id === id) {
      callback(currentItem);
      return;
    } else if (currentItem.children && currentItem.children.length > 0) {
      queue.push(...currentItem.children);
    }
  }
  return list;
};

const dfsNodeAction = (
  structure: any,
  id: any,
  callback: any,
  parent: any[] = []
) => {
  for (let item of structure) {
    if (item.id === id) {
      callback(item, parent[parent.length - 1]);
      return;
    } else if (item.type === "folder") {
      parent.push(item);
      dfsNodeAction(item.children, id, callback, parent);
    }
  }
  parent.pop();
};

export { dfsNodeAction, bfsNodeAction };
