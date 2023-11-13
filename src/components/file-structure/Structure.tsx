import React, {
  useRef,
  forwardRef,
  PropsWithRef,
  useEffect,
  useState,
} from "react";
import "../../styles/structure.css";
import parse from "html-react-parser";
// import structureData from "./structureData";
import {
  Directory,
  ItemType,
  getInitialSet,
  setSelected,
} from "../../state/features/structure/structureSlice";
// import { mapStructureRecursively } from "../../state/features/structure/utils/traversal";
import Folder from "./Folder";
import useOutsideAlerter from "../../hooks/useOutsideAlerter";
// import { useTypedSelector, useTypedDispatch } from '../../state/hooks';

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
  const clickedRef = useRef<HTMLElement>();
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
    if (!clickedRef.current) return;
    if (clickedRef.current === fileSysRef.current) {
      appendTo.current = fileSysRef.current.childNodes[0] as HTMLElement;
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
      dispatch(addNode({ value, inputType: inputType as ItemType }));
    }

    // structureRef.current?.classList.remove('dont-overflow')
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
      if (!elem.classList.contains("file-sys-container")) {
        return;
      } else {
        // actions[3].disabled = true;
        clickedRef.current = elem as HTMLElement;
      }
    }

    let item: HTMLElement | null = null;

    if (!elem.classList.contains("file-sys-container")) {
      item = fileSysRef.current.querySelector(`#${parentId}`);
      // console.log("ITAM 1", item);
    } else {
      item = fileSysRef.current;
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

    setSelectedType(
      elem.classList.contains("structure-container") ? "head" : type
    );
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

  // const fileSysRef = useRef<HTMLDivElement>(null);
  // const count = useTypedSelector((state) => state.counter.value)
  // const dispatch = useTypedDispatch()
  const structureData = useTypedSelector(getInitialSet);
  // const structure = mapStructureRecursively(structureData);
  const dispatch = useTypedDispatch();

  useOutsideAlerter(fileSysRef, () => {
    if (selectedI !== "head") {
      dispatch(setSelected({ id: "head" }));
    }
  });

  const emptyHandler = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    dispatch(setSelected({ id: "head" }));
    dispatch(
      contextClick({
        id: "head",
        type: "folder",
        threeDot: { x: e.clientY, y: e.clientX },
      })
    );
  };

  return (
    <>
      <FileActions {...fileActions} />

      <div
        id="structure-container"
        className="pl-1 pr-2 file-sys-container custom-scrollbar-2"
        ref={fileSysRef}
        onContextMenu={(e) => contextHandler(e)}
        // onClick={(e) => fileStructureClickHandler(e, fileSysRef)}
      >
        <Folder data={structureData as Directory[]} />

        {allFileIds.length === 0 && allFolderIds.length === 1 && (
          <div
            id="welcome"
            onContextMenu={(e) => emptyHandler(e)}
            className="flex h-[40vh] items-center px-4"
          >
            <span className="text-base text-center w-fit mx-auto p-3 rounded-lg border">
              Start developing with LiteCode...
            </span>
          </div>
        )}
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
            rename: isRename ? { name: thisItem?.name } : undefined,
          }}
          container={fileSysRef.current}
          existingItems={
            isRename
              ? currentItems.filter(({ id }) => id !== thisItem?.id)
              : currentItems
          }
        />,
        appendTo.current as HTMLElement
      )}

      <MenuContext
        top={points.x}
        left={points.y}
        showContext={showContext}
        setShowContext={setShowContext}
        actions={actions}
      />
    </>
  );
};

export default Structure;
