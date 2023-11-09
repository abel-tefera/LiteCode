const trimName = (name: string, isFile: boolean) => {
  const [fname, ext] = name.split(".");
  let newName: string = "";
  if (isFile) {
    if (fname.length > 10) {
      newName = `${fname.slice(0, 10)}...${ext}`;
    } else {
      newName = name;
    }
  } else {
    if (fname.length > 12) {
      newName = `${fname.slice(0, 12)}...`;
    } else {
      newName = name;
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

export {
  getLogo,
  trimName
};
