import {
  FileStructure,
  NormalizedFolder,
} from "../../state/features/structure/structureSlice";

const trimName = (item: NormalizedFolder | FileStructure) => {
  let newName = "";
  if (item.type === "file") {
    const fullName = `${item.name}.${item.extension}`;
    const [fname, ext] = fullName.split(".");
    if (fname.length > 10) {
      newName = `${fname.slice(0, 10)}...${ext}`;
    } else {
      newName = fullName;
    }
  } else if (item.type === "folder") {
    if (item.name.length > 12) {
      newName = `${item.name.slice(0, 12)}...`;
    } else {
      newName = item.name;
    }
  }
  // TODO Optimize Too many calls
  // console.log("NAME", newName);
  return newName;
};

const getLogo = (fileType: string) => {
  let logo: string = "";
  switch (fileType) {
    case "js":
      logo = "js-logo";
      break;
    case "jsx":
      logo = "jsx-logo";
      break;
    case "css":
      logo = "css-logo";
      break;
    case "md":
      logo = "md-logo";
      break;
    default:
      logo = "file-logo";
      break;
  }
  return logo;
};

export { getLogo, trimName };
