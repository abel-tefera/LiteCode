// @ts-nocheck
import React, { useRef, useState } from "react";
import "./structure.css";
import parse from "html-react-parser";
import structureData from "./structureData";
import { getTranslateX, getStyle } from "../../utils/getStyle";

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
            `<div class='folder-container measurable parent-collapsed ${
              index !== 0 ? `not-seen` : `flex`
            }'><span class="folder clickable" data-iscollapsed="true">
              <span class="span-text transformer" style="padding-left: ${
                index + 1
              }rem">
                <span class="span-logo closed-folder">&nbsp;</span>
                <span class="folder-name">${((() => {
                  const [fname] = key.split(".");
                  if (fname.length > 12) {
                    return `${fname.slice(0, 12)}...`;
                  }
                  return key;
                }))()}</span>
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
              return `<div class='file clickable measurable span-text parent-collapsed ${
                index !== 0 && `not-seen`
              }'>
                <span class="transformer" style="padding-left: ${index + 1}rem">
                    <span class="span-logo ${logo}">&nbsp;</span>
                    <span class="file-name">${((() => {
                      const [fname, ext] = file.split(".");
                      if (fname.length > 12) {
                        return `${fname.slice(0, 12)}...${ext}`;
                      }
                      return file;
                    }))()}</span>
                </span></div>`;
            })
            .join("");
          // @ts-ignore
          domBuilder.splice(index, 0, x);
        }
      }
    }
    return domBuilder.join("");
  }

  const collapseMeasurables = (measurables: any, max: any) => {
    for (let i = 0; i < measurables.length; i++) {
      const measurable = measurables[i];
      if (
        !measurable.classList.contains("not-seen")
      ) {
        if (max > 64) {
          measurable.style.width = `${200 + max - 64}px`;
        } else {
          measurable.style.width = `${200}px`;
        }
      }
    }
  };


  const clickHandler = (event: any) => {
    if (fileSysRef.current == null) return;
    const elem = event.target;
    const type = elem.classList.contains("folder") ? "folder" : "file";
    if (elem !== event.currentTarget) {
      if (type === "file") {
        alert("File accessed");
      } else if (type === "folder") {
        const isCollapsed = elem.dataset.iscollapsed === "true";

        const toggleElems = [].slice.call(elem.parentElement.children);
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

        const measurables =
          fileSysRef.current.getElementsByClassName("measurable");

        const children =
          elem.parentElement.getElementsByClassName("measurable");
        let max = 0;
        console.log("PARENT", elem.parentElement);
        // const tX = getTranslateX(transformers[0]);
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

          const classList = [...measurable.classList];

          if (
            !classList.some((el) => el === "not-seen" || el === "parent-collapsed")
          ) {
            const transformer =
              measurable.getElementsByClassName("transformer")[0];
            const padding = getStyle(transformer, "padding-left");
            const paddingInt = parseInt(padding);
            if (paddingInt > max) {
              max = paddingInt;
            }
          }
        }
        collapseMeasurables(measurables, max);

        if (!isCollapsed) {
          folderIcon.classList.remove("opened-folder");
          folderIcon.classList.add("closed-folder");
          folderIcon.classList.add("parent-collapsed");
        } else {
          folderIcon.classList.remove("closed-folder");
          folderIcon.classList.remove("parent-collapsed");
          folderIcon.classList.add("opened-folder");
        }

        elem.dataset.iscollapsed = !isCollapsed;
      }
    }
  };

  return (
    <div
      className="file-sys-container custom-scrollbar"
      ref={fileSysRef}
      onClick={clickHandler}
    >
      {parse(mapObjectRecursively(structureData))}
    </div>
  );
};

export default Structure;
