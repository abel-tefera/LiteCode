const traverseStructure = (currentFolder: any) => {
    // const list = [];
    // const queue = currentFolder;
    // while (queue.length > 0) {
    //   currentFolder = queue.shift();
    //   list.push(currentFolder.name);
    //   if (currentFolder.children && currentFolder.children.length > 0) {
    //     queue.push(currentFolder.children);
    //   }
    // }
    // return list;
};

// const structureData = {
//   id: "root",
//   name: "Folder 1",
//   children: [
//     {
//       id: "root2",
//       name: "Folder 2",
//       children: [
//         {
//           id: "root3",
//           name: "Folder 1",
//         },
//         {
//           id: "file1",
//           name: "File 1",
//           type: "File",
//         },
//       ],
//     },
//     {
//         id: "root4",
//         name: "Folder 4",
//         type: "folder",
//         children: [
//           {
//             id: "root5",
//             name: "Folder 5",
//           },
//           {
//             id: "file2",
//             name: "File 2",
//             type: "file",
//           },
//         ],
//     },
//   ],
// };

// console.log(traverseStructure(structureData.children))
export { traverseStructure };
