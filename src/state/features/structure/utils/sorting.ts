const findSortable = (structure: any, callback: any, id: any = null) => {
  if (structure.type === "folder" && id === structure.id) {
    return callback(structure);
  } else if (structure.type === "folder"){
    callback(structure);
  }
  const children = structure.childrenIdsAndType as Array<any>;
  for (let item of children) {
    if (item.type === "folder") {
      findSortable(item, callback, id);
    }
  }
};

export { findSortable };
