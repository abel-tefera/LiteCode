import React, { useEffect, useState, useRef } from "react";
import classNames from "classnames";
import {
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
} from "@heroicons/react/24/outline";
import Structure from "../file-structure/Structure";
import FileActions from "../file-structure/FileActions";
import logo from "../../assets/logo-2.png";
import MenuContext from "../menus/MenuContext";
import CustomInput from "../file-structure/CustomInput";
import { createPortal } from "react-dom";
import {
  collapseOrExpand,
  fileStructure,
  folderStructure,
  getLogo,
} from "../file-structure/StructureUtils";
import { getStyle } from "../../utils/getStyle";
import { usePrependPortal } from "../../hooks/usePrependPortal";
import Dialog from "../menus/Dialog";

type SidebarProps = {
  collapsed: boolean;
  setCollapsed(collapsed: boolean): void;
  shown: boolean;
};

const Sidebar: React.FC<SidebarProps> = ({
  collapsed,
  shown,
  setCollapsed,
}) => {
  const [visibility, setVisibility] = useState(collapsed);
  const Icon = collapsed ? ChevronDoubleRightIcon : ChevronDoubleLeftIcon;

  const [clicked, setClicked] = useState(false);
  const clickedRef = useRef<HTMLElement>();
  const [points, setPoints] = useState({
    x: 0,
    y: 0,
  });

  const structureRef = useRef<HTMLDivElement>(null);
  const prependTo = useRef<HTMLElement | null>(null);

  const [showInput, setShowInput] = useState(false);
  const [inputPadding, setInputPadding] = useState(0);

  const [inputType, setInputType] = useState<"file" | "folder" | "">("");
  const [rename, setRename] = useState<boolean>(false);

  const [showDialog, setShowDialog] = useState(false);

  const prependForPortal = (isNew: boolean) => {
    if (!clickedRef.current) return;

    if (
      clickedRef.current.classList.contains("main-nav") ||
      clickedRef.current === structureRef.current
    ) {
      if (!structureRef.current) return;

      if (!isNew) {
        prependTo.current = structureRef.current.childNodes[0] as HTMLElement;
        if (!prependTo.current) {
          prependTo.current = structureRef.current;
        }
      } else {
        prependTo.current = structureRef.current;
      }
    } else {
      if (isNew) {
        collapseOrExpand(clickedRef.current, structureRef, false);
      }
      const parent = clickedRef.current.parentElement;
      const childNodes = parent?.childNodes;
      prependTo.current = parent as HTMLElement;

      if (isNew) {
        findPrependTo(childNodes, parent);
      } else {
        findPrependToRename(parent);
      }
    }
  };

  const setPadding = (isNew: boolean) => {
    if (!clickedRef.current) return;
    const sibling = clickedRef.current.getElementsByClassName(
      "transformer"
    )[0] as HTMLElement;
    const type = clickedRef.current.classList.contains("folder")
      ? "folder"
      : "file";
    if (sibling) {
      const padding = getStyle(sibling, "padding-left");
      if (type === "folder" && isNew) {
        setInputPadding(parseInt(padding));
      } else {
        setInputPadding(parseInt(padding) - 16);
      }
    }
  };

  const createFileInput = () => {
    if (!clickedRef.current) return;

    setPadding(true);

    prependForPortal(true);

    setShowInput(true);
  };

  const createFileInputForRename = () => {
    // loop through children of folder to find nth element === clicked ref
    // insert input into nth position
    // input display hidden
    prependForPortal(false);
    setPadding(false);
    setShowInput(true);
  };

  const actions = [
    {
      title: "New File",
      handler: () => {
        setInputType("file");
        createFileInput();
      },
    },
    {
      title: "New Folder",
      handler: () => {
        setInputType("folder");
        createFileInput();
      },
    },
    {
      type: "hr",
      handler: () => {},
    },
    {
      title: "Cut",
      handler: () => {},
    },
    {
      title: "Copy",
      handler: () => {},
    },
    {
      title: "Paste",
      handler: () => {},
    },
    {
      type: "hr",
      handler: () => {},
    },
    {
      title: "Rename",
      handler: () => {
        if (!clickedRef.current) return;
        clickedRef.current?.classList.add("hide-input");
        const type = clickedRef.current.classList.contains("folder")
          ? "folder"
          : "file";
        setInputType(type);
        createFileInputForRename();
        setRename(true);
      },
    },
    {
      title: "Delete",
      handler: () => {
        setShowDialog(true);
        // if (!clickedRef.current) return;
        // const type = clickedRef.current.classList.contains("folder")
        //   ? "folder"
        //   : "file";

        // if (
        //   type === "file" &&
        //   clickedRef.current.parentElement === structureRef.current
        // ) {
        //   clickedRef.current.remove();
        // } else if (type === "file") {
        //   if (
        //     clickedRef.current.parentElement &&
        //     clickedRef.current.parentElement?.childNodes.length <= 2
        //   ) {
        //     collapseOrExpand(
        //       clickedRef.current.parentElement.getElementsByClassName(
        //         "clickable"
        //       )[0] as HTMLElement,
        //       structureRef,
        //       true
        //     );
        //   }
        //   clickedRef.current.remove();
        // } else if (
        //   type === "folder" &&
        //   clickedRef.current.parentElement === structureRef.current
        // ) {
        //   collapseOrExpand(clickedRef.current, structureRef, true);
        //   clickedRef.current.parentElement?.remove();
        // } else if (type === "folder") {
        //   const grandParent = clickedRef.current.parentElement
        //     ?.parentElement as HTMLElement;
        //   if (grandParent && grandParent?.childNodes.length <= 2) {
        //     collapseOrExpand(
        //       grandParent.getElementsByClassName("clickable")[0] as HTMLElement,
        //       structureRef,
        //       true
        //     );
        //   } else {
        //     collapseOrExpand(clickedRef.current, structureRef, true);
        //   }

        //   clickedRef.current.parentElement?.remove();
      },
    },
  ];

  const findPrependTo = (
    childNodes: NodeListOf<ChildNode> | undefined,
    parent: HTMLElement | null
  ): NodeJS.Timeout => {
    const timeout = setTimeout(() => {
      if (childNodes) {
        const input = childNodes[0];
        const header = childNodes[1];
        parent?.insertBefore(header, input);
      }
    }, 0);
    return timeout;
  };

  const findPrependToRename = (
    parentNode: ParentNode | undefined | null
  ): NodeJS.Timeout => {
    const timeout = setTimeout(() => {
      if (parentNode && parentNode.childNodes) {
        const childNodes = parentNode.childNodes;
        const input = childNodes[0];
        let idx = 0;
        for (let i = 1; i < childNodes.length; i++) {
          if (childNodes[i] === clickedRef.current) {
            idx = i;
            break;
          }
        }
        parentNode.insertBefore(input, childNodes[idx]);
      }
    }, 0);
    return timeout;
  };

  const inputSubmit = (value: string | false) => {
    if (!clickedRef.current) return;

    if (rename === true || value === false) {
      setShowInput(false);
      clickedRef.current?.classList.remove("hide-input");
      setRename(false);
      return;
    }

    let paddingRem: number = 0;
    if (inputPadding > 16) {
      paddingRem = inputPadding / 16;
    } else if (inputPadding > 0) {
      paddingRem = 1;
    }
    let styles: string,
      markup: string = "";

    if (inputType === "file") {
      // @ts-ignore
      [styles, markup] = fileStructure(
        value,
        paddingRem,
        getLogo(value.split(".").reverse()[0]),
        false
      );
    } else if (inputType === "folder") {
      [styles, markup] = folderStructure(value, paddingRem, false);
    }

    const element = document.createElement("div");
    element.innerHTML = markup;
    // @ts-ignore
    element.classList.add(...styles.split(" "));
    element.style.width = "auto";

    if (
      clickedRef.current.classList.contains("main-nav") ||
      clickedRef.current === structureRef.current
    ) {
      const appendTo = structureRef.current as HTMLElement;
      appendTo.appendChild(element);
    } else {
      const appendTo = clickedRef.current.parentElement as HTMLElement;
      appendTo.appendChild(element);
    }
    // structureRef.current?.classList.remove('dont-overflow')
    setShowInput(false);
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      setVisibility(!collapsed);
    }, 300);

    return () => clearTimeout(timeout);
  }, [collapsed]);

  useEffect(() => {
    if (rename === true && showInput === false) {
      clickedRef.current?.classList.remove("hide-input");
      setRename(false);
      return;
    }
  }, [rename, showInput]);

  const contextHandler = (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
    e.preventDefault();
    const elem = e.target as HTMLElement;
    clickedRef.current = elem;

    // @ts-ignore
    if (e.clientY > 300) {
      setPoints({
        x: e.clientY - 265,
        y: e.clientX,
      });
    } else {
      setPoints({
        x: e.clientY,
        y: e.clientX,
      });
    }

    setClicked(true);
  };

  return (
    <div
      className={classNames({
        "fixed bg-dark-bg md:static md:translate-x-0 z-20 ": true,
        "transition-all duration-300 ease-in-out": true,
        "w-[250px] max-w-[250px] ": !collapsed,
        "w-20 min-w-[80px]": collapsed,
        "-translate-x-full": !shown,
      })}
    >
      <div className="h-[18px]">&nbsp;</div>
      <div
        className={classNames({
          "flex flex-col justify-between h-[95vh] sticky inset-0 w-full": true,
        })}
      >
        <div
          className={classNames({
            "flex items-center mb-[7px]": true,
            "px-4 py-2 justify-between": !collapsed,
            "py-2 justify-center": collapsed,
          })}
        >
          {!collapsed && (
            <img src={logo} alt="Logo" className="w-[7.5rem] select-none" />
          )}
          <button
            className="grid place-content-center hover:bg-dark-hover w-10 h-10 rounded-full opacity-0 md:opacity-100"
            onClick={() => setCollapsed(!collapsed)}
          >
            <Icon className="w-5 h-5" />
          </button>
        </div>
        <nav
          className="flex select-none flex-col flex-grow main-nav"
          onContextMenu={contextHandler}
        >
          <div
            className={
              !collapsed && visibility ? "block main-content" : "display-none"
            }
          >
            <FileActions />
            <Structure ref={structureRef} />
          </div>
        </nav>
        <MenuContext
          top={points.x}
          left={points.y}
          clicked={clicked}
          setClicked={setClicked}
          actions={actions}
        />
        {usePrependPortal(
          <CustomInput
            closeCallback={() => {
              // if (clickedRef.current) {
              //   clickedRef.current.parentElement?.classList.remove(
              //     "folder-container-reverse"
              //   );
              // }
              // structureRef.current?.classList.remove('dont-overflow')
              setShowInput(false);
            }}
            submit={(value) => {
              inputSubmit(value);
            }}
            padding={inputPadding + 1}
            show={clickedRef.current && showInput}
            item={{
              type: inputType,
              rename,
            }}
            container={structureRef.current}
          />,
          prependTo.current as HTMLElement
        )}

        {showDialog &&
          createPortal(
            <Dialog close={setShowDialog} />,
            document.getElementById("root") as HTMLElement
          )}
        {!collapsed && (
          <div className="ml-4 text-base" id="my-d">
            <div
              className={
                visibility ? `inline-flex items-center select-none` : `hidden`
              }
            >
              Developed by&nbsp;
              <a
                href="https://www.abeltb.xyz/"
                target="_blank"
                rel="noreferrer"
                className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
              >
                Abel
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default Sidebar;
