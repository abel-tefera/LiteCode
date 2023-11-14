import React, { useRef, useEffect, useState } from "react";
import "../../styles/structure.css";

import {
  Directory,
  FileInFolder,
  ItemType,
  getInitialSet,
  setSelected,
} from "../../state/features/structure/structureSlice";
import Folder from "./Folder";
import useOutsideAlerter from "../../hooks/useOutsideAlerter";

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
  selectedItem,
  setParentItemId,
  getCurrentItems,
} from "../../state/features/structure/structureSlice";
import { usePrependPortal } from "../../hooks/usePrependPortal";
import FileActions from "./FileActions";
import { useTypedDispatch, useTypedSelector } from "../../state/hooks";

const Structure = () => {
  const fileSysRef = useRef<HTMLDivElement>(null);
  const structureRef = useRef<HTMLDivElement>(null);
  const clickedRef = useRef<HTMLElement>();

  const dispatch = useTypedDispatch();

  const structureData = useTypedSelector(getInitialSet);
  const contextSelectedE = useTypedSelector(contextSelectedEvent);
  const contextSelectedId = useTypedSelector(contextSelectedItem);
  const contextSelectedType = useTypedSelector(contextSelectedItemType);
  const selectedI = useTypedSelector(selectedItem);
  const thisItem = useTypedSelector(getItem);
  const clipboardExists = useTypedSelector(clipboard);
  const allFileIds = useTypedSelector(fileIds);
  const allFolderIds = useTypedSelector(folderIds);
  const currentItems = useTypedSelector(getCurrentItems);

  const [showContext, setShowContext] = useState(false);
  const [selectedType, setSelectedType] = useState<
    "file" | "folder" | "head" | ""
  >("");

  const [points, setPoints] = useState({
    x: 0,
    y: 0,
  });

  const appendTo = useRef<HTMLElement | null>(null);

  const [showInput, setShowInput] = useState(false);
  const [inputPadding, setInputPadding] = useState(0);

  const [inputType, setInputType] = useState<"file" | "folder" | "">("");
  const [isRename, setIsRename] = useState(false);

  const [showDialog, setShowDialog] = useState(false);

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
            id: contextSelectedId as string,
            type: contextSelectedType as ItemType,
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
            id: contextSelectedId as string,
            type: contextSelectedType as ItemType,
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
      disabled: selectedType === "file" || !clipboardExists,
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
    let elem = fileSysRef.current?.querySelector(`#${selectedI}`);
    if (!elem) {
      elem = fileSysRef.current;
    }
    clickedRef.current = elem as HTMLElement;
  };

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
    if (!clickedRef.current) {
      setClickedCurrent();
    }
    if (!clickedRef.current) {
      return;
    }
    if (clickedRef.current === fileSysRef.current) {
      appendTo.current = fileSysRef.current as HTMLElement;

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

      if (isRename) {
      appendTo.current = clickedRef.current.parentElement as HTMLElement;
        clickedRef.current.classList.add("hide-input");
        setInputPadding(0);
      } else {
        appendTo.current = structureRef.current?.querySelector("#ghost-input-" + clickedRef.current.id) as HTMLElement;
        setInputPadding(1);
      }
    }
  };

  const showInputHandler = (v: boolean) => {
    if (v === showInput) return;
    setShowInput(v);
    if (allFileIds.length === 0 && allFolderIds.length === 1) {
      const welcome = document.getElementById("welcome") as HTMLElement;
      if (v && !welcome.classList.contains("display-none-c")) {
        welcome.classList.add("display-none-c");
      } else if (!v && welcome.classList.contains("display-none-c")) {
        welcome.classList.remove("display-none-c");
      }
    }
  };

  const createFileInput = () => {
    dispatch(setParentItemId(contextSelectedId as string));
    prependForPortal(false);
    showInputHandler(true);
  };

  const createFileInputForRename = () => {
    dispatch(setParentItemId(""));
    prependForPortal(true);
    showInputHandler(true);
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
      dispatch(addNode({ value, inputType: inputType as ItemType }));
    }

    showInputHandler(false);
  };

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
    if (!fileSysRef.current) return;
    const type = elem.getAttribute("typeof-item") as "file" | "folder" | "";
    const parentId = elem.getAttribute("parent-id") as string;

    if (type === null || parentId === null) {
      if (!elem.classList.contains("welcome")) {
        return;
      } else if (elem.classList.contains("file-sys-ref"))
        clickedRef.current = elem as HTMLElement;
    }

    let item: HTMLElement | null = null;

    if (!elem.classList.contains("file-sys-container")) {
      item = fileSysRef.current.querySelector(`#${parentId}`);
    } else {
      item = fileSysRef.current;
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

    setSelectedType(parentId === "head" ? "head" : type);
    setShowContext(true);
  };
  const contextHandler = (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
    e.preventDefault();
    if (!fileSysRef.current) return;
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
      elem = fileSysRef.current?.querySelector(`#${contextSelectedId}`)
        ?.childNodes[0] as HTMLElement;
    }
    handleContext(
      { clientY: contextSelectedE.x, clientX: contextSelectedE.y },
      elem
    );
  }, [contextSelectedE]);

  useOutsideAlerter(structureRef, () => {
    if (selectedI !== "head") {
      dispatch(setSelected({ id: "head", type: "folder" }));
    }
  });

  return (
    <div id="file-system">
      <FileActions {...fileActions} />

      <div
        id="structure-container"
        parent-id={"head"}
        typeof-item={"folder"}
        className="pl-1 pr-2 file-sys-container custom-scrollbar-2"
        ref={fileSysRef}
        onContextMenu={(e) => contextHandler(e)}
        // onClick={(e) => fileStructureClickHandler(e, fileSysRef)}
      >
        <div
          parent-id={"head"}
          typeof-item={"folder"}
          ref={structureRef}
          className="content flex items-center"
        >
          <Folder data={structureData as (Directory | FileInFolder)[]} />

          {allFileIds.length === 0 && allFolderIds.length === 1 && (
            <div
              id="welcome"
              parent-id={"head"}
              typeof-item={"folder"}
              className="flex h-[40vh] items-center px-4 mx-auto"
            >
              <span
                parent-id={"head"}
                typeof-item={"folder"}
                className="text-base text-center break-words p-3 rounded-lg border"
              >
                Start developing with LiteCode...
              </span>
            </div>
          )}
        </div>
      </div>
      {showDialog &&
        createPortal(
          <Dialog
            title={`Delete ${selectedType}?`}
            content={`Are you sure you want to delete this ${selectedType}? This action cannot be
            undone.`}
            actionText={`Yes, delete ${selectedType}`}
            close={setShowDialog}
            action={() => {
              dispatch(removeNode({ id: null, type: null }));
              setShowDialog(false);
            }}
          />,
          document.getElementById("root") as HTMLElement
        )}

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
            rename: isRename
              ? {
                  wholeName:
                    thisItem.type === "file"
                      ? `${thisItem.name}.${thisItem.extension}`
                      : thisItem.name,
                }
              : undefined,
          }}
          container={fileSysRef.current}
          existingItems={(() => {
            const items = currentItems.map((item) => {
              return {
                id: item.id,
                type: item.type,
                wholeName:
                  item.type === "file"
                    ? `${item.name}.${item.extension}`
                    : item.name,
              };
            });
            if (isRename) {
              return items.filter(({ id }) => id !== thisItem?.id);
            } else {
              return items;
            }
          })()}
        />,
        appendTo.current as HTMLElement
      )}

      {showContext &&
        createPortal(
          <MenuContext
            top={points.x}
            left={points.y}
            showContext={showContext}
            setShowContext={setShowContext}
            actions={actions}
          />,
          document.getElementById("file-system") as HTMLElement
        )}
    </div>
  );
};

export default Structure;
