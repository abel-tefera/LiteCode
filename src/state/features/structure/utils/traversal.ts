import FolderStructure from "../../../../components/file-structure/FolderStructure";
import {
  fileStructure,
  folderStructure,
  getLogo,
} from "../../../../components/file-structure/StructureUtils";

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
  // console.log("ACTION", structure, id, callback, parent)
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

// normalized: {
//   files: {
//     byId: {},
//     allIds: [],
//   },
//   folders: {
//     byId: {},
//     allIds: [],
//   },
// }

const mapStructureRecursively = (
  structure: any,
  normalized: any = {
    files: {
      byId: {},
      allIds: [],
    },
    folders: {
      byId: {},
      allIds: [],
    },
  }
) => {
  for (let item of structure) {
    if (item.type === "folder") {
      const folder = item;
      normalized.folders.byId[folder.id] = folder;
      normalized.folders.allIds.push(folder.id);
      // const folder = FolderStructure(props) as React.ReactElement;
      // normalized// if (stack.length !== 0) {
      // //   const parent = stack[stack.length - 1];
      // //   parent.children.push(folder);
      // // } else {
      // //   root.push(folder);
      // // }
      // .stack
      //   .push(folder);

      mapStructureRecursively(item.children, normalized);
      // stack.pop();
    } else if (item.type === "file") {
      const file = item;
      normalized.files.byId[file.id] = file;
      normalized.files.allIds.push(file.id);

      // if (stack.length !== 0) {
      //   const parent = stack[stack.length - 1];
      //   parent.props.children.push(file);
      // } else {
      //   root.push(file);
      // }
    }
  }
  return normalized;
};

// const structureData = {
//     id: 'head',
//     name: 'body',
//     children: [
//         {
//             id: "root",
//             name: "Folder 1",
//             children: [
//                 {
//                     id: "root2",
//                     name: "Folder 2",
//                     children: [
//                         {
//                             id: "root3",
//                             name: "Folder 3",
//                         },
//                         {
//                             id: "file1",
//                             name: "File 1",
//                             type: "File",
//                         },
//                     ],
//                 },
//                 {
//                     id: "root4",
//                     name: "Folder 4",
//                     type: "folder",
//                     children: [
//                         {
//                             id: "root5",
//                             name: "Folder 5",
//                         },
//                         {
//                             id: "file2",
//                             name: "File 2",
//                             type: "file",
//                         },
//                     ],
//                 },
//             ],
//         }
//     ]
// };

export { dfsNodeAction, bfsNodeAction };
