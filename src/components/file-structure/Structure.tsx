import React, { useRef, useEffect, useState } from "react";
import "../../styles/structure.css";

import {
  Directory,
  FileInFolder,
  ItemType,
  getInitialSet,
  isResizeCollapsed,
  setContextSelectedForFileAction,
  setResizeCollapsed,
  setSearchFocused,
  setSelected,
} from "../../state/features/structure/structureSlice";
import Folder from "./Folder";
import useOutsideAlerter from "../../hooks/useOutsideAlerter";

import MenuContext from "../menus/MenuContext";
import CustomInput from "./widgets/CustomInput";
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
  contextSelectedObj,
  clipboard,
  folderIds,
  fileIds,
  selectedItem,
  setParentItemId,
  getCurrentItems,
  search,
} from "../../state/features/structure/structureSlice";
import { usePrependPortal } from "../../hooks/usePrependPortal";
import FileActions from "./widgets/FileActions";
import { useTypedDispatch, useTypedSelector } from "../../state/hooks";
import { removeTabAsync } from "../../state/features/tabs/tabsSlice";
import { removeActiveEditorAsync } from "../../state/features/editor/editorSlice";
import searchIcon from "../../assets/search-icon.svg";
import fileExplorer from "../../assets/file-explorer.svg";

const Structure = () => {
  const fileSysRef = useRef<HTMLDivElement>(null);
  const structureRef = useRef<HTMLDivElement>(null);
  const clickedRef = useRef<HTMLElement>();

  const dispatch = useTypedDispatch();
  const isCollapsed = useTypedSelector(isResizeCollapsed);
  const structureData = useTypedSelector(getInitialSet);
  const contextSelectedE = useTypedSelector(contextSelectedEvent);
  const contextSelectedItemProps = useTypedSelector(contextSelectedObj);
  const contextSelectedId = useTypedSelector(contextSelectedItem);
  const contextSelectedType = useTypedSelector(contextSelectedItemType);
  const selectedI = useTypedSelector(selectedItem);
  const thisItem = useTypedSelector(getItem);
  const clipboardExists = useTypedSelector(clipboard);
  const allFileIds = useTypedSelector(fileIds);
  const allFolderIds = useTypedSelector(folderIds);
  const currentItems = useTypedSelector(getCurrentItems);
  const [showBlue, setShowBlue] = useState(true);
  const [showGray, setShowGray] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);
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
      dispatch(setContextSelectedForFileAction());
      setClickedCurrent();
      createFileInput();
    },

    newFolder: () => {
      setInputType("folder");
      dispatch(setContextSelectedForFileAction());
      setClickedCurrent();
      createFileInput();
    },

    download: () => {},

    searchFiles: (searchTerm: string) => {
      setSearchTerm(searchTerm);
    },
  };

  useEffect(() => {
    if (searchTerm.length > 0) {
      const timer = setTimeout(async () => {
        dispatch(search(searchTerm));
        setIsSearching(true);
      }, 300);
      return () => {
        clearTimeout(timer);
      };
    } else {
      if (isSearching) {
        setIsSearching(false);
        dispatch(search(''));
      }
    }
  }, [searchTerm]);

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
        appendTo.current = structureRef.current?.querySelector(
          "#ghost-input-" + clickedRef.current.id
        ) as HTMLElement;
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

    if (e.clientY > 335) {
      setPoints({
        x: e.clientY - 310,
        y: e.clientX,
      });
    } else {
      setPoints({
        x: e.clientY - 70,
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
      // setShowBlue(false);
      // setShowGray(false);
    }
  });

  useEffect(() => {
    setShowBlue(true);
  }, [selectedI]);

  return (
    <>
      {!isCollapsed ? (
        <div id="file-system">
          <FileActions
            {...fileActions}
            isSearching={
              isSearching && allFileIds.length > 0 && allFolderIds.length > 1
            }
          />

          {!isSearching && (
            <div
              id="structure-container"
              parent-id={"head"}
              typeof-item={"folder"}
              className="pl-1 mr-2 file-sys-container custom-scrollbar-2"
              ref={fileSysRef}
              onClick={(e) => {
                dispatch(setSelected({ id: "head", type: "folder" }));
              }}
              onContextMenu={(e) => contextHandler(e)}
              // onClick={(e) => fileStructureClickHandler(e, fileSysRef)}
            >
              <div
                parent-id={"head"}
                typeof-item={"folder"}
                ref={structureRef}
                className="content flex items-center"
              >
                <Folder
                  data={structureData as (Directory | FileInFolder)[]}
                  showBlue={showBlue}
                  setShowBlue={setShowBlue}
                  showGray={showGray}
                  setShowGray={setShowGray}
                />

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
          )}

          {showDialog &&
            createPortal(
              <Dialog
                title={`Delete the ${selectedType} ${contextSelectedItemProps.wholeName}?`}
                content={`Are you sure you want to delete the ${selectedType} ${contextSelectedItemProps.actualPath}? This action cannot be
            undone.`}
                actionText={`Yes, delete ${selectedType}`}
                close={setShowDialog}
                action={() => {
                  dispatch(removeNode({ id: null, type: null }));
                  dispatch(removeTabAsync());
                  dispatch(removeActiveEditorAsync(contextSelectedId));
                  setShowDialog(false);
                }}
              />,
              document.getElementById("root") as HTMLElement
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
      ) : (
        <div className="flex flex-col items-center justify-start w-20 h-full">
          <button
            onClick={() => {
              dispatch(setResizeCollapsed(false));
              dispatch(setSearchFocused(true));
            }}
            type="button"
            className="my-3"
          >
            <img
              src={searchIcon}
              className="w-14 h-14 hover:bg-dark-hover rounded-md p-2"
            />
          </button>
          <hr className="w-5/6 border-t border-t-zinc-500" />

          <button
            onClick={() => {
              dispatch(setResizeCollapsed(false));
              dispatch(setSearchFocused(false));
              dispatch(search(''));
              setIsSearching(false);
            }}
            type="button"
            className="my-3"
          >
            <img
              src={fileExplorer}
              className="w-14 h-14 hover:bg-dark-hover rounded-md p-2"
            />
          </button>
        </div>
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
    </>
  );
};

export default Structure;
