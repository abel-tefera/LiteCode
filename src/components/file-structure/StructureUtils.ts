import { getStyle } from "../../utils/getStyle";

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

const folderStructure = (
  key: string,
  index: number,
  nested: boolean
): string[] => {
  const styles = `folder-container measurable ${
    nested && index !== 0 ? `not-seen` : `flex`
  } ${nested && `parent-collapsed`}`;
  const opening = `<div class='${styles}'>`;
  const body = `<span class="folder clickable" data-iscollapsed="true">
        <span class="span-text transformer" style="padding-left: ${
          index + 1
        }rem">
          <span class="span-logo closed-folder">&nbsp;</span>
          <span class="folder-name">${trimName(key, false)}</span>
        </span>
      </span>`;
  const closing = `</div>`;

  if (nested) {
    return [`${opening}${body}`, closing];
  } else {
    return [styles, `${body}${closing}`];
  }
};

const fileStructure = (
  file: string,
  index: number,
  logo: string,
  nested: boolean
): string | string[] => {
  const styles = `file clickable measurable span-text ${
    nested && index !== 0 && `not-seen`
  } ${nested && `parent-collapsed`}`;
  const body = `<span class="transformer" style="padding-left: ${
    index + 1
  }rem;">
  <span class="span-logo ${logo}">&nbsp;</span>
  <span class="file-name">${trimName(file, true)}</span>
</span>`;

  if (nested) {
    return `<div class='${styles}'>
  ${body}
</div>`;
  } else {
    return [styles, body];
  }
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

const mapObjectRecursively = (
  obj: {
    [k: string]: any;
  },
  domBuilder: string[] = [],
  index = 0
) => {
  for (let key in obj) {
    if (key !== "Files") {
      // @ts-ignore
      const [opening, closing] = folderStructure(key, index, true);
      domBuilder.splice(index, 0, opening, closing);
      index += 1;
      mapObjectRecursively(obj[key], domBuilder, index);
      index -= 1;
    } else {
      const x = obj[key]
        // eslint-disable-next-line
        .map((file: any) => {
          const fileType = file.split(".")[1];
          const logo: string = getLogo(fileType);

          return fileStructure(file, index, logo, true);
        })
        .join("");
      domBuilder.splice(index, 0, x);
    }
  }
  return domBuilder.join("");
};

const collapseMeasurables = (
  measurables: HTMLCollectionOf<HTMLElement>,
  max: number
) => {
  const width = window.innerWidth;
  let offset: 35 | 0 = 0;
  if (width >= 768) {
    offset = 0;
  } else {
    offset = 35;
  }

  for (let i = 0; i < measurables.length; i++) {
    const measurable = measurables[i];
    if (!measurable.classList.contains("not-seen")) {
      if (max > 48) {
        measurable.style.width = `${200 + max - 32 + offset}px`;
      } else {
        measurable.style.width = `${200 + offset}px`;
      }
    }
  }
};

const collapseOrExpand = (
  elem: HTMLElement,
  fileSysRef: any,
  collapse: boolean
) => {
  const isCollapsed = elem.dataset.iscollapsed === "true";
  if (!isCollapsed && !collapse) return;
  const toggleElems = elem.parentElement
    ? Array.from(elem.parentElement.children)
    : [];
  const classNames = "file,folder-container,noitems".split(",");
  toggleElems.forEach((element: any) => {
    if (
      classNames.some((val) => {
        return element.classList.contains(val);
      })
    )
      if (!isCollapsed) {
        element.classList.add("not-seen");
        element.classList.remove("flex");
      } else {
        element.classList.remove("not-seen");
        element.classList.add("flex");
      }
  });

  const folderIcon = elem.querySelector(".span-logo");
  // @ts-ignore
  const measurables = fileSysRef.current.getElementsByClassName(
    "measurable"
  ) as HTMLCollectionOf<HTMLElement>;

  const children = elem.parentElement
    ? Array.from(elem.parentElement.getElementsByClassName("measurable"))
    : [];

  let max = 0;
  if (children.length > 0) {
    for (let i = 1; i < children.length; i++) {
      const child = children[i];
      if (!isCollapsed) {
        child.classList.add("parent-collapsed");
      } else {
        child.classList.remove("parent-collapsed");
      }
    }
  }

  for (let i = 0; i < measurables.length; i++) {
    const measurable = measurables[i];

    const classList = [...Array.from(measurable.classList)];

    if (
      !classList.some((el) => el === "not-seen" || el === "parent-collapsed")
    ) {
      const transformers = measurable.getElementsByClassName(
        "transformer"
      ) as HTMLCollectionOf<HTMLElement>;

      const transformer = transformers[0];
      const padding = getStyle(transformer, "padding-left");
      const paddingInt = parseInt(padding);
      if (paddingInt > max) {
        max = paddingInt;
      }
    }
  }
  collapseMeasurables(measurables, max);

  if (!isCollapsed) {
    folderIcon?.classList.remove("opened-folder");
    folderIcon?.classList.add("closed-folder");
    folderIcon?.classList.add("parent-collapsed");
  } else {
    folderIcon?.classList.remove("closed-folder");
    folderIcon?.classList.remove("parent-collapsed");
    folderIcon?.classList.add("opened-folder");
  }

  elem.dataset.iscollapsed = (!isCollapsed).toString();
};

const fileStructureClickHandler = (
  event: React.MouseEvent<HTMLElement, MouseEvent>,
  fileSysRef: any
) => {
  // @ts-ignore
  if (fileSysRef && fileSysRef.current == null) return;
  const elem = event.target as HTMLElement;
  const type = elem.classList.contains("folder") ? "folder" : "file";
  if (elem !== event.currentTarget) {
    if (type === "file") {
      alert("File accessed");
    } else if (type === "folder") {
      collapseOrExpand(elem, fileSysRef, true);
    }
  }
};

export {
  mapObjectRecursively,
  fileStructureClickHandler,
  collapseOrExpand,
  folderStructure,
  fileStructure,
  getLogo
};
