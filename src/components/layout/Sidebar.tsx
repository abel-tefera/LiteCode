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

import { getStyle } from "../../utils/getStyle";
// import { usePrependPortal } from "../../hooks/usePrependPortal";
import Dialog from "../menus/Dialog";
import {
  addNode,
  collapseOrExpand,
  contextSelectedId,
  renameNode,
} from "../../state/features/structure/structureSlice";
import { useTypedDispatch } from "../../state/hooks";
import { useDispatch } from "react-redux";
import { usePrependPortal } from "../../hooks/usePrependPortal";
import { useSelector } from "react-redux";

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
  const contextSelected = useSelector(contextSelectedId);

  const [visibility, setVisibility] = useState(collapsed);
  const Icon = collapsed ? ChevronDoubleRightIcon : ChevronDoubleLeftIcon;

  const [showContext, setShowContext] = useState(false);
  const clickedRef = useRef<HTMLElement>();
  const [selectedType, setSelectedType] = useState<
    "file" | "folder" | "main" | ""
  >("");

  const [points, setPoints] = useState({
    x: 0,
    y: 0,
  });

  const structureRef = useRef<HTMLDivElement>(null);
  const appendTo = useRef<HTMLElement | null>(null);

  const [showInput, setShowInput] = useState(false);
  const [inputPadding, setInputPadding] = useState(0);

  const [inputType, setInputType] = useState<"file" | "folder" | "">("");
  const [isRename, setIsRename] = useState<boolean>(false);

  const [showDialog, setShowDialog] = useState(false);

  const dispatch = useDispatch();

  const actions = [
    {
      title: "New File",
      handler: () => {
        setInputType("file");
        createFileInput();
      },
      disabled: selectedType === "file",
    },
    {
      title: "New Folder",
      handler: () => {
        setInputType("folder");
        createFileInput();
      },
      disabled: selectedType === "file",
    },
    {
      type: "hr",
      handler: () => {},
    },
    {
      title: "Cut",
      handler: () => {},
      disabled: selectedType === "main",
    },
    {
      title: "Copy",
      handler: () => {},
      disabled: selectedType === "main",
    },
    {
      title: "Paste",
      handler: () => {},
      disabled: selectedType === "file",
    },
    {
      type: "hr",
      handler: () => {},
    },
    {
      title: "Rename",
      handler: () => {
        if (!clickedRef.current) return;
        // clickedRef.current?.classList.add("hide-input");

        // setInputType(type);
        createFileInputForRename();
        setIsRename(true);
      },
      disabled: selectedType === "main",
    },
    {
      title: "Delete",
      handler: () => {
        setShowDialog(true);
      },
      disabled: selectedType === "main",
    },
  ];

  useEffect(() => {
    if (!contextSelected) return;
    contextHandler(contextSelected.e);
  }, [contextSelected]);

  const prependForPortal = (isNew: boolean) => {
    console.log("HERE", clickedRef.current, structureRef.current);
    if (!clickedRef.current) return;
    if (clickedRef.current === structureRef.current) {
      appendTo.current = structureRef.current.childNodes[0] as HTMLElement;
      // if (!isNew) {
      //   appendTo.current = structureRef.current.childNodes[0] as HTMLElement;
      //   if (!appendTo.current) {
      //     appendTo.current = structureRef.current;
      //   }
      // } else {
      //   appendTo.current = structureRef.current;
      // }
    } else {
      // if (isNew) {
      //   const itemType = clickedRef.current.getAttribute("typeof-item");
      //   if (itemType === "folder") {
      //     dispatch(
      //       collapseOrExpand({
      //         item: { id: clickedRef.current.id, type: "folder" },
      //         collapse: false,
      //       })
      //     );
      //     setInputPadding(1);
      //   } else {
      //     setInputPadding(0);
      //   }
      // }
      // // @ts-ignore
      // const parent = clickedRef.current.parentElement;
      // const childNodes = parent?.childNodes;
      // appendTo.current = parent as HTMLElement;
      // // console.log("ISNEW", isNew, childNodes, parent);
      // if (isNew) {
      //   // findPrependTo(childNodes, parent);
      // } else {
      //   // findPrependToRename(parent);
      // }
    }
  };

  const createFileInput = () => {
    console.log("CR FILE INP");
    if (!clickedRef.current) return;

    prependForPortal(true);

    setShowInput(true);
  };

  const createFileInputForRename = () => {
    // loop through children of folder to find nth element === clicked ref
    // insert input into nth position
    // input display hidden
    prependForPortal(false);
    setShowInput(true);
  };

  const findPrependTo = (
    childNodes: NodeListOf<ChildNode> | undefined,
    parent: HTMLElement | null
  ): NodeJS.Timeout => {
    const timeout = setTimeout(() => {
      if (childNodes) {
        const input = childNodes[2];
        const body = childNodes[1] as HTMLElement;
        if (body.classList.contains("sub-folder")) {
          parent?.insertBefore(input, body);
        }
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
        const top = childNodes[0];
        let idx = childNodes.length - 1;
        // console.log("XXX", childNodes)
        // for (let i = 1; i < childNodes.length; i++) {
        //   if (childNodes[i] === clickedRef.current) {
        //     idx = i;
        //     break;
        //   }
        // }
        parentNode.insertBefore(top, childNodes[idx]);
      }
    }, 0);
    return timeout;
  };

  const inputSubmit = (value: string | false) => {
    if (!clickedRef.current) return;

    if (isRename === true || value === false) {
      // console.log("DISPATCHING");
      // dispatch(renameNode());

      setShowInput(false);
      clickedRef.current?.classList.remove("hide-input");
      setIsRename(false);
      return;
    }

    dispatch(addNode({ value, inputType }));

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
    if (isRename === true && showInput === false) {
      clickedRef.current?.classList.remove("hide-input");
      setIsRename(false);
      return;
    }
  }, [isRename, showInput]);

  const contextHandler = (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
    e.preventDefault();
    if (!structureRef.current) return;
    const elem = e.target as HTMLElement;

    const type = elem.getAttribute("typeof-item") as "file" | "folder" | "";
    const parentId = elem.getAttribute("parent-id") as string;

    if (type === null || parentId === null) {
      if (!elem.classList.contains("main-nav")) {
        return;
      } else {
        // actions[3].disabled = true;
        clickedRef.current = elem as HTMLElement;
      }
    }

    let item: HTMLElement | null = null;

    if (!elem.classList.contains("main-nav")) {
      item = structureRef.current.querySelector(`#${parentId}`);
      console.log("ITAM 1", item);
    } else {
      item = structureRef.current;
      console.log("ITAM 2", item);
    }

    clickedRef.current = item as HTMLElement;

    // const clickedId = elem.id;
    // console.log("TYPE", item)

    // console.log("XX", elem)
    // if (clickedRef.current?.classList.contains("sidebar-container")) {
    //   console.log("SIDEBAR");
    // } else {
    //   console.log("IN");
    //   clickedRef.current = elem.parentElement?.parentElement as HTMLElement;
    // }
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

    setSelectedType(elem.classList.contains("main-nav") ? "main" : type);
    setShowContext(true);
  };

  return (
    <div
      className={classNames({
        "fixed bg-dark-bg md:static md:translate-x-0 z-20 sidebar-container":
          true,
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
          showContext={showContext}
          setShowContext={setShowContext}
          actions={actions}
        />
        {
          // appendTo.current &&
          usePrependPortal(
            <CustomInput
              closeCallback={() => {
                setShowInput(false);
              }}
              submit={(value) => {
                inputSubmit(value);
              }}
              padding={inputPadding}
              show={clickedRef.current && showInput}
              item={{
                type: inputType,
                rename: isRename,
              }}
              container={structureRef.current}
            />,
            appendTo.current as HTMLElement
          )
        }

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
                {" "}
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
