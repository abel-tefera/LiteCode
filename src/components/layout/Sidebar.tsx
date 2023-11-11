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

import Dialog from "../menus/Dialog";
import {
  addNode,
  collapseOrExpand,
  contextClick,
  contextSelectedEvent,
  contextSelectedItem,
  removeNode,
  renameNode,
  getItem,
  setToCopy,
  copyNode,
  contextSelectedItemType,
  clipboard,
  folderIds,
  fileIds,
  selectedItem
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
  const contextSelectedE = useSelector(contextSelectedEvent);
  const contextSelectedId = useSelector(contextSelectedItem);
  const contextSelectedType = useSelector(contextSelectedItemType);
  const selectedI = useSelector(selectedItem);
  const thisItem = useSelector(getItem);
  const clipboardExists = useSelector(clipboard);
  const allFileIds = useSelector(fileIds);
  const allFolderIds = useSelector(folderIds);

  const [visibility, setVisibility] = useState(collapsed);
  const Icon = collapsed ? ChevronDoubleRightIcon : ChevronDoubleLeftIcon;

  const [showContext, setShowContext] = useState(false);
  const clickedRef = useRef<HTMLElement>();
  const [selectedType, setSelectedType] = useState<
    "file" | "folder" | "head" | ""
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
  const [isRename, setIsRename] = useState(false);

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
      handler: () => {
        dispatch(
          setToCopy({
            id: contextSelectedId,
            type: contextSelectedType,
            isCut: true,
          })
        );
      },
      disabled: selectedType === "head",
    },
    {
      title: "Copy",
      handler: () => {
        dispatch(
          setToCopy({
            id: contextSelectedId,
            type: contextSelectedType,
            isCut: false,
          })
        );
      },
      disabled: selectedType === "head",
    },
    {
      title: "Paste",
      handler: () => {
        dispatch(copyNode());
      },
      disabled: selectedType === "file" || clipboardExists.id === null,
    },
    {
      type: "hr",
      handler: () => {},
    },
    {
      title: "Rename",
      handler: () => {
        setInputType(
          clickedRef.current?.getAttribute("typeof-item") as
            | "file"
            | "folder"
            | ""
        );
        createFileInputForRename();
        setIsRename(true);
      },
      disabled: selectedType === "head",
    },
    {
      title: "Delete",
      handler: () => {
        setShowDialog(true);
      },
      disabled: selectedType === "head",
    },
  ];

  const setClickedCurrent = () => {
    let elem = structureRef.current?.querySelector(`#${selectedI}`);
    if (!elem){
      elem = structureRef.current;
    }
    clickedRef.current = elem as HTMLElement;
  }

  const fileActions = {
    newFile: () => {
      setInputType("file");
      setClickedCurrent();
      createFileInput();
    },

    newFolder: () => {
      setInputType("folder");
      setClickedCurrent();
      createFileInput();
    },

    download: () => {},
  };

  const prependForPortal = (isRename: boolean) => {
    if (!clickedRef.current) return;
    if (clickedRef.current === structureRef.current) {
      appendTo.current = structureRef.current.childNodes[0] as HTMLElement;
      setInputPadding(0);
    } else {
      if (!isRename) {
        dispatch(
          collapseOrExpand({
            item: { id: clickedRef.current.id, type: "folder" },
            collapse: false,
          })
        );
      }

      appendTo.current = clickedRef.current.parentElement as HTMLElement;
      if (isRename) {
        clickedRef.current.classList.add("hide-input");
        setInputPadding(0);
      } else {
        findPrependTo(
          clickedRef.current.parentElement?.childNodes,
          clickedRef.current.parentElement
        );
        setInputPadding(1);
      }
    }
  };

  const showInputHandler = (v: boolean) => {
    if (v === showInput) return;
    setShowInput(v);
    if (allFileIds.length === 0 && allFolderIds.length === 0) {
      const welcome = document.getElementById("welcome") as HTMLElement;
      if (v && !welcome.classList.contains("display-none-c")) {
        welcome.classList.add("display-none-c");
      } else if (!v && welcome.classList.contains("display-none-c")) {
        welcome.classList.remove("display-none-c");
      }
    }
  };

  const createFileInput = () => {
    prependForPortal(false);
    showInputHandler(true);
  };

  const createFileInputForRename = () => {
    prependForPortal(true);
    showInputHandler(true);
  };

  const findPrependTo = (
    childNodes: NodeListOf<ChildNode> | undefined,
    parent: HTMLElement | null
  ): NodeJS.Timeout => {
    const timeout = setTimeout(() => {
      if (childNodes) {
        const input = childNodes[0];
        const body = childNodes[1] as HTMLElement;
        if (body.classList.contains("clickable")) {
          parent?.insertBefore(body, input);
        }
      }
    }, 0);
    return timeout;
  };

  const inputSubmit = (value: string | false) => {
    if (!clickedRef.current) return;

    if (isRename === true || value === false) {
      showInputHandler(false);
      clickedRef.current?.classList.remove("hide-input");
      if (isRename === true && value !== false) {
        dispatch(renameNode({ value }));
      }
      setIsRename(false);
      return;
    } else {
      dispatch(addNode({ value, inputType }));
    }

    // structureRef.current?.classList.remove('dont-overflow')
    showInputHandler(false);
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

  const handleContext = (
    e: { clientY: number; clientX: number },
    elem: HTMLElement
  ) => {
    if (!structureRef.current) return;
    const type = elem.getAttribute("typeof-item") as "file" | "folder" | "";
    const parentId = elem.getAttribute("parent-id") as string;

    if (type === null || parentId === null) {
      if (!elem.classList.contains("file-sys-container")) {
        return;
      } else {
        // actions[3].disabled = true;
        clickedRef.current = elem as HTMLElement;
      }
    }

    let item: HTMLElement | null = null;

    if (!elem.classList.contains("file-sys-container")) {
      item = structureRef.current.querySelector(`#${parentId}`);
      // console.log("ITAM 1", item);
    } else {
      item = structureRef.current;
      // console.log("ITAM 2", item);
    }

    clickedRef.current = item as HTMLElement;

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

    setSelectedType(elem.classList.contains("structure-container") ? "head" : type);
    setShowContext(true);
  };
  const contextHandler = (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
    e.preventDefault();
    if (!structureRef.current) return;
    const elem = e.target as HTMLElement;

    handleContext(
      { clientY: e.clientY, clientX: e.clientX },
      elem as HTMLElement
    );
    const parentId = elem.getAttribute("parent-id") as string;
    const type = elem.getAttribute("typeof-item") as "file" | "folder" | "";

    dispatch(contextClick({ id: parentId, type: type, threeDot: false }));
  };

  useEffect(() => {
    if (!contextSelectedE) return;
    let elem: HTMLElement;
    if (contextSelectedId === "head") {
      elem = document.querySelector(".main-nav") as HTMLElement;
    } else {
      elem = structureRef.current?.querySelector(`#${contextSelectedId}`)
        ?.childNodes[0] as HTMLElement;
    }
    handleContext(
      { clientY: contextSelectedE.x, clientX: contextSelectedE.y },
      elem
    );
  }, [contextSelectedE]);

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
          onContextMenu={(e) => contextHandler(e)}
        >
          <div
            className={
              !collapsed && visibility ? "block main-content" : "display-none-c"
            }
          >
            <FileActions {...fileActions} />
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
        {usePrependPortal(
          <CustomInput
            closeCallback={() => {
              showInputHandler(false);
            }}
            submit={(value) => {
              inputSubmit(value);
            }}
            padding={inputPadding}
            show={clickedRef.current && showInput}
            item={{
              type: inputType,
              rename: isRename ? thisItem : undefined,
            }}
            container={structureRef.current}
          />,
          appendTo.current as HTMLElement
        )}

        {showDialog &&
          createPortal(
            <Dialog
              title={`Delete ${selectedType}?`}
              content={`Are you sure you want to delete this ${selectedType}? This action cannot be
            undone.`}
              actionText={`Yes, delete ${selectedType}`}
              close={setShowDialog}
              action={() => {
                dispatch(removeNode({}));
                setShowDialog(false);
              }}
            />,
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
