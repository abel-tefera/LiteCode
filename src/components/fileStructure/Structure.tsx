// @ts-nocheck
import React, { useRef } from "react";
import "./structure.css";
import parse from "html-react-parser";
import structureData from "./structureData";

const Structure = () => {
  const fileSysRef = useRef<any>(null);

  function mapObjectRecursively(obj: any, domBuilder = [], index = 0) {
    for (let key in obj) {
      if (obj.hasOwnProperty(key)) {
        if (key !== "Files") {
          domBuilder.splice(
            index,
            0,
            // @ts-ignore
            `<div class='folder-container ${
              index !== 0 ? `display-none`: `flex`
            }'><span class="folder clickable" data-isexpanded="true">
              <span class="span-text" style="padding-left: ${index + 1}rem">
                <span class="span-logo closed-folder">&nbsp;</span>
                <span class="folder-name">${key}</span>
              </span>
            </span>`,
            `</div>`
          );
          index += 1;
          mapObjectRecursively(obj[key], domBuilder, index);
          index -= 1;
          // domBuilder.push(`<div class="folder-container"><span class="folder fa-folder-o" data-isexpanded="true">${key}</span>`);
        } else {
          const x = obj[key]
            // eslint-disable-next-line no-loop-func
            .map((file: any) => {
              let logo: string | undefined;
              const fileType = file.split(".")[1];
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
              return `<span class='file clickable span-text ${
                index !== 0 && `display-none`
              }' style="padding-left: ${index + 1}rem; padding-right: 1rem">
                    <span class="span-logo ${logo}">&nbsp;</span>
                    <span class="file-name">${file}</span>
                </span>`;
            })
            .join("");
          // @ts-ignore
          domBuilder.splice(index, 0, x);
        }
      }
    }
    return domBuilder.join("");
  }

  const clickHandler = (event: any) => {
    if (fileSysRef.current == null) return;

    const elem = event.target;
    if (elem.tagName.toLowerCase() === "span" && elem !== event.currentTarget) {
      const type = elem.classList.contains("folder") ? "folder" : "file";
      console.log("HERE", type);
      if (type === "file") {
        alert("File accessed");
      } else if (type === "folder") {
        const isExpanded = elem.dataset.isexpanded === "true";
        const folderIcon = elem.querySelector(".span-logo");

        if (!isExpanded) {
          folderIcon.classList.remove("opened-folder");
          folderIcon.classList.add("closed-folder");
        } else {
          folderIcon.classList.remove("closed-folder");
          folderIcon.classList.add("opened-folder");
        }
        elem.dataset.isexpanded = !isExpanded;
        const toggleElems = [].slice.call(elem.parentElement.children);
        const classNames = "file,folder-container,noitems".split(",");
        toggleElems.forEach((element: any) => {
          if (
            classNames.some((val) => {
              return element.classList.contains(val);
            })
          )
            if (!isExpanded) {
              element.classList.add("display-none");
            } else {
              element.classList.remove("display-none");
            }
        });
      }
    }
  };

  return (
    <div className="file-sys-container custom-scrollbar m-2" ref={fileSysRef} onClick={clickHandler}>
      {parse(mapObjectRecursively(structureData))}
    </div>
  );
};

export default Structure;
