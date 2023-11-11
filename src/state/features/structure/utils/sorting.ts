const prepareSort = (structure: any, callback: any) => {

  callback(structure.children);
  const children = structure.children as Array<any>;
  for (let item of children) {
    if (item.type === "folder") {
      prepareSort(item, callback);
    }
  }
};

export { prepareSort };
