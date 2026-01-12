import React, { useRef, useEffect, useState, PropsWithChildren } from 'react';
import '../../styles/structure.css';

import {
  type ItemType,
  getInitialSet,
  isResizeCollapsed,
  setContextSelectedForFileAction,
  setResizeCollapsed,
  setSearchFocused,
  setSelected,
} from '../../state/features/structure/structureSlice';
import Folder from './Folder';
import useOutsideAlerter from '../../hooks/useOutsideAlerter';

import MenuContext from '../menus/MenuContext';
import CustomInput from './widgets/CustomInput';
import { createPortal } from 'react-dom';

import Dialog from '../menus/Dialog';
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
} from '../../state/features/structure/structureSlice';
import { usePrependPortal } from '../../hooks/usePrependPortal';
import FileActions from './widgets/FileActions';
import { useTypedDispatch, useTypedSelector } from '../../state/hooks';
import {
  activeTabs,
  removeTabAsync,
} from '../../state/features/tabs/tabsSlice';
import { Tooltip } from 'react-tooltip';
import downloadZip from '../../state/features/structure/utils/downloadZip';
import { setActiveEditorAsync } from '../../state/features/editor/editorSlice';
import SearchInput from './search/SearchInput';
import OpenEditors from './widgets/OpenEditors';
import SearchContainer from './search/SearchContainer';
import { findParent } from '../../state/features/structure/utils/traversal';

const Structure: React.FC<PropsWithChildren> = () => {
  const fileSysRef = useRef<HTMLDivElement>(null);
  const fileSysContainerRef = useRef<HTMLDivElement>(null);
  const fileExplorerContainerRef = useRef<HTMLDivElement>(null);

  const structureRef = useRef<HTMLDivElement>(null);
  const clickedRef = useRef<HTMLElement | null>(null);
  const [structureCollapsed, setStructureCollapsed] = useState(false);

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
  const tabs = useTypedSelector(activeTabs);

  const [openEditorCollapsed, setOpenEditorCollapsed] = useState(false);

  const [showBlue, setShowBlue] = useState(true);
  const [showGray, setShowGray] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [showContext, setShowContext] = useState(false);
  const [selectedType, setSelectedType] = useState<
    'file' | 'folder' | 'head' | ''
  >('');

  const [points, setPoints] = useState({
    x: 0,
    y: 0,
  });

  const hrRef = useRef<HTMLHRElement>(null);

  const tabHeight = 34.24;
  const tabsRatio = Math.floor(window.innerHeight / (tabHeight + 16) / 2) - 1;

  const appendTo = useRef<HTMLElement | null>(null);

  const [showInput, setShowInput] = useState(false);
  const [inputPadding, setInputPadding] = useState(0);

  const [inputType, setInputType] = useState<'file' | 'folder' | ''>('');
  const [isRename, setIsRename] = useState(false);

  const [showDialog, setShowDialog] = useState(false);

  const actions = [
    {
      title: 'New File',
      handler: () => {
        setInputType('file');
        createFileInput();
      },
      disabled: selectedType === 'file',
    },
    {
      title: 'New Folder',
      handler: () => {
        setInputType('folder');
        createFileInput();
      },
      disabled: selectedType === 'file',
    },
    {
      type: 'hr',
      handler: () => {},
    },
    {
      title: 'Cut',
      handler: () => {
        dispatch(
          setToCopy({
            id: contextSelectedId,
            type: contextSelectedType as ItemType,
            isCut: true,
          }),
        );
      },
      disabled: selectedType === 'head',
    },
    {
      title: 'Copy',
      handler: () => {
        dispatch(
          setToCopy({
            id: contextSelectedId,
            type: contextSelectedType as ItemType,
            isCut: false,
          }),
        );
      },
      disabled: selectedType === 'head',
    },
    {
      title: 'Paste',
      handler: async () => {
        dispatch(copyNode());
        if (clipboardExists !== null && clipboardExists.isCut) {
          await dispatch(removeTabAsync());
          await dispatch(setActiveEditorAsync({ id: '', line: 0 }));
        }
      },
      disabled: selectedType === 'file' || clipboardExists === null,
    },
    {
      type: 'hr',
      handler: () => {},
    },
    {
      title: 'Rename',
      handler: () => {
        setInputType(
          clickedRef.current?.getAttribute('typeof-item') as
            | 'file'
            | 'folder'
            | '',
        );
        createFileInputForRename();
        setIsRename(true);
      },
      disabled: selectedType === 'head',
    },
    {
      title: 'Delete',
      handler: () => {
        setShowDialog(true);
      },
      disabled: selectedType === 'head',
    },
  ];

  const setClickedCurrent = (selectedItem: string = selectedI) => {
    let elem = fileSysRef.current?.querySelector(`#${selectedItem}`);
    if (!elem) {
      elem = fileSysRef.current;
    }
    clickedRef.current = elem as HTMLElement;
  };

  const searchFiles = (searchTermNew: string) => {
    if (searchTermNew !== searchTerm) {
      setSearchTerm(searchTermNew);
    } else if (!isSearching && searchTerm.length > 0) {
      dispatch(search(searchTerm));
      setIsSearching(true);
    }
  };

  const fileActions = {
    newFile: () => {
      setInputType('file');

      const parentId = findParent(selectedI, allFileIds, structureData);
      dispatch(setContextSelectedForFileAction(parentId));
      setClickedCurrent(parentId);
      createFileInput(parentId);
    },

    newFolder: () => {
      setInputType('folder');
      const parentId = findParent(selectedI, allFileIds, structureData);
      dispatch(setContextSelectedForFileAction(parentId));
      setClickedCurrent(parentId);
      createFileInput(parentId);
    },

    download: () => {
      downloadZip();
    },
    collapseArea: () => {
      if (!fileExplorerContainerRef.current || !fileSysRef.current) return;

      if (structureCollapsed) {
        fileSysRef.current.classList.remove('no-height');
      } else {
        fileSysRef.current.classList.add('no-height');
      }

      hrRef.current?.classList.add('border-t-transparent');
      hrRef.current?.classList.remove('border-t-zinc-600');
      setStructureCollapsed(!structureCollapsed);
    },
  };

  useEffect(() => {
    if (!fileSysRef.current) return;
    if (!structureCollapsed) {
      const timeout = setTimeout(() => {
        fileSysRef.current!.classList.remove('hidden-scrollbar');
      }, 300);
      fileSysRef.current!.classList.remove('visibility-hidden');
      return () => clearTimeout(timeout);
    } else {
      const timeout = setTimeout(() => {
        fileSysRef.current!.classList.add('visibility-hidden');
      }, 300);
      fileSysRef.current.classList.add('hidden-scrollbar');
      return () => clearTimeout(timeout);
    }
  }, [structureCollapsed]);

  useEffect(() => {
    if (searchTerm.length > 0) {
      const timer = setTimeout(() => {
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
    if (
      clickedRef.current === fileSysRef.current ||
      (clickedRef.current.id.includes('file') && !isRename)
    ) {
      appendTo.current = fileSysRef.current as HTMLElement;

      setInputPadding(0);
    } else {
      if (!isRename) {
        dispatch(
          collapseOrExpand({
            item: { id: clickedRef.current.id, type: 'folder' },
            collapse: false,
          }),
        );
      }

      if (isRename) {
        appendTo.current = clickedRef.current.parentElement as HTMLElement;
        clickedRef.current.classList.add('hide-input');
        setInputPadding(0);
      } else {
        appendTo.current = structureRef.current?.querySelector(
          '#ghost-input-' + clickedRef.current.id,
        ) as HTMLElement;
        setInputPadding(1);
      }
    }
  };

  const showInputHandler = (v: boolean) => {
    if (v === showInput) return;
    setShowInput(v);
    if (allFileIds.length === 0 && allFolderIds.length === 1) {
      const welcome = document.getElementById('welcome') as HTMLElement;
      if (v && !welcome.classList.contains('display-none-c')) {
        welcome.classList.add('display-none-c');
      } else if (!v && welcome.classList.contains('display-none-c')) {
        welcome.classList.remove('display-none-c');
      }
    }
  };

  const createFileInput = (parentId: string = contextSelectedId) => {
    if (!fileSysRef.current) return;
    if (structureCollapsed) {
      fileSysRef.current.classList.remove('no-height');
      setStructureCollapsed(false);
    }
    dispatch(setParentItemId(parentId));
    prependForPortal(false);
    showInputHandler(true);
  };

  const createFileInputForRename = () => {
    dispatch(setParentItemId(''));
    prependForPortal(true);
    showInputHandler(true);
  };

  const inputSubmit = (value: string | false) => {
    if (!clickedRef.current) return;
    if (isRename || value === false) {
      showInputHandler(false);
      clickedRef.current?.classList.remove('hide-input');
      if (isRename && value !== false) {
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
    if (isRename && !showInput) {
      clickedRef.current?.classList.remove('hide-input');
      setIsRename(false);
    }
  }, [isRename, showInput]);

  const handleContext = (
    e: { clientY: number; clientX: number },
    elem: HTMLElement,
  ) => {
    if (!fileSysRef.current || !elem) return;
    const type = elem.getAttribute('typeof-item') as 'file' | 'folder' | '';
    const parentId = elem.getAttribute('parent-id') as string;
    if (type === null || parentId === null) {
      if (
        !elem.classList.contains('welcome') &&
        !elem.classList.contains('clickable-padding')
      ) {
        return;
      } else if (elem.classList.contains('file-sys-ref')) {
        clickedRef.current = elem;
      }
    }

    let item: HTMLElement | null = null;

    if (!elem.classList.contains('file-sys-container')) {
      item = fileSysRef.current.querySelector(`#${parentId}`);
    } else {
      item = fileSysRef.current;
    }

    clickedRef.current = item as HTMLElement;
    if (e.clientY > window.innerHeight / 2) {
      setPoints({
        x: e.clientY - 245,
        y: e.clientX,
      });
    } else {
      setPoints({
        x: e.clientY,
        y: e.clientX,
      });
    }

    setSelectedType(parentId === 'head' ? 'head' : type);
    setShowContext(true);
  };
  const contextHandler = (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
    e.preventDefault();
    if (!fileSysRef.current) return;
    const elem = e.target as HTMLElement;
    handleContext({ clientY: e.clientY, clientX: e.clientX }, elem);
    const parentId = elem.getAttribute('parent-id') as string;
    const type = elem.getAttribute('typeof-item') as 'file' | 'folder' | '';

    dispatch(contextClick({ id: parentId, type, threeDot: false }));
  };

  useEffect(() => {
    if (!contextSelectedE) return;
    let elem: HTMLElement;
    if (contextSelectedId === 'head') {
      elem = document.querySelector('.main-nav') as HTMLElement;
    } else {
      elem = fileSysRef.current?.querySelector(`#${contextSelectedId}`)
        ?.childNodes[0] as HTMLElement;
    }
    handleContext(
      { clientY: contextSelectedE.x, clientX: contextSelectedE.y },
      elem,
    );
  }, [contextSelectedE]);

  useOutsideAlerter(structureRef, () => {
    if (selectedI !== 'head') {
      setShowBlue(false);
      setShowGray(false);
    }
  });

  useOutsideAlerter(fileSysContainerRef, () => {
    if (!fileSysRef.current) return;

    fileSysRef.current.classList.add('border-transparent');
    fileSysRef.current?.classList.remove('border-vscode-blue');
  });

  useEffect(() => {
    if (!fileSysRef.current) return;
    if (selectedI !== 'head') {
      fileSysRef.current.classList.add('border-transparent');
      fileSysRef.current?.classList.remove('border-vscode-blue');
    }
    setShowBlue(true);
  }, [selectedI]);

  const getHeight = () => {
    let height;
    if (!openEditorCollapsed) {
      height = window.innerHeight * 0.3;
      if (tabs.length < tabsRatio) {
        height = window.innerHeight * 0.5 - tabs.length * tabHeight + 16;
      }
    } else {
      height = window.innerHeight * 0.55;
    }
    if (tabs.length === 0) {
      height = window.innerHeight * 0.6;
    }
    return height - 16;
  };

  useEffect(() => {
    if (!fileSysRef.current) return;
    fileSysRef.current.style.height = `${getHeight()}px`;
  }, [tabs.length]);

  useEffect(() => {
    if (!fileSysRef.current) return;
    fileSysRef.current.style.height = `${getHeight()}px`;
  }, [openEditorCollapsed]);

  return (
    <>
      {!isCollapsed ? (
        <div id="file-system" className="pr-2">
          <SearchInput searchFiles={searchFiles} />

          <div className="left-wrapper flex w-full flex-col justify-start">
            {!isSearching && (
              <OpenEditors
                collapsed={openEditorCollapsed}
                setCollapseArea={() => {
                  if (openEditorCollapsed && tabs.length > 0) {
                    hrRef.current?.classList.remove('border-t-transparent');
                    hrRef.current?.classList.add('border-t-zinc-600');
                  } else {
                    hrRef.current?.classList.add('border-t-transparent');
                    hrRef.current?.classList.remove('border-t-zinc-600');
                  }
                  setOpenEditorCollapsed(!openEditorCollapsed);
                }}
                structureCollapsed={structureCollapsed}
              />
            )}
            {!openEditorCollapsed && tabs.length > 0 && (
              <span className="my-[1px] flex w-full justify-center pl-2">
                <hr
                  ref={hrRef}
                  className={`left-wrapper-hr w-full border-t ${
                    openEditorCollapsed || tabs.length === 0
                      ? 'border-t-transparent'
                      : 'border-t-zinc-600'
                  }`}
                />
              </span>
            )}

            <div
              ref={fileExplorerContainerRef}
              className={`flex w-full flex-col transition-[transform] duration-300 ease-out`}
            >
              <div className="flex flex-col items-start pb-2 pl-2">
                {isSearching && allFileIds.length > 0 ? (
                  <div className="custom-scrollbar-3 h-[70vh] w-full overflow-y-auto">
                    <SearchContainer />
                  </div>
                ) : (
                  <FileActions
                    {...fileActions}
                    collapsed={structureCollapsed}
                  />
                )}
              </div>
              {!isSearching && (
                <div
                  ref={fileSysContainerRef}
                  onContextMenu={(e) => {
                    setShowBlue(false);
                    setShowGray(true);
                    contextHandler(e);
                  }}
                  parent-id={'head'}
                  typeof-item={'folder'}
                  onClick={(e) => {
                    if (!fileSysRef.current) return;
                    if (allFileIds.length > 0 || allFolderIds.length > 1) {
                      fileSysRef.current.classList.remove('border-transparent');
                      fileSysRef.current.classList.add('border-vscode-blue');
                    }
                    dispatch(setSelected({ id: 'head', type: 'folder' }));
                  }}
                  className="flex h-full w-full flex-col"
                >
                  <div
                    id="structure-container"
                    parent-id={'head'}
                    typeof-item={'folder'}
                    style={{ maxHeight: `${getHeight()}px` }}
                    className={`custom-scrollbar-2 hidden-scrollbar flex h-full flex-col overflow-y-auto border border-transparent py-1 pl-1 transition-[height] duration-300 ease-out  ${
                      structureCollapsed ? 'no-height' : ''
                    }`}
                    ref={fileSysRef}

                    // onClick={(e) => fileStructureClickHandler(e, fileSysRef)}
                  >
                    <div
                      parent-id={'head'}
                      typeof-item={'folder'}
                      ref={structureRef}
                      className="content flex items-center"
                    >
                      <Folder
                        data={structureData.subFoldersAndFiles}
                        showBlue={showBlue}
                        setShowBlue={setShowBlue}
                        showGray={showGray}
                        setShowGray={setShowGray}
                      />

                      {allFileIds.length === 0 && allFolderIds.length === 1 && (
                        <div
                          id="welcome"
                          parent-id={'head'}
                          typeof-item={'folder'}
                          onClick={(e) => e.stopPropagation()}
                          onContextMenu={(e) => {
                            contextHandler(e);
                          }}
                          className="mx-auto flex h-[40vh] items-center pl-3 pr-4"
                        >
                          <div
                            parent-id={'head'}
                            typeof-item={'folder'}
                            className="select-none break-words rounded-lg border p-3 text-center text-base"
                          >
                            <div
                              parent-id={'head'}
                              typeof-item={'folder'}
                              className="flex flex-col justify-center"
                            >
                              <div
                                parent-id={'head'}
                                typeof-item={'folder'}
                                className="flex items-center"
                              >
                                Start developing with LiteCode...
                              </div>
                              <div
                                parent-id={'head'}
                                typeof-item={'folder'}
                                className="my-2 flex w-full flex-col items-center justify-between text-sm"
                              >
                                <button
                                  parent-id={'head'}
                                  typeof-item={'folder'}
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    fileActions.newFile();
                                  }}
                                  className="new-btns bg-vscode-overlay my-1 w-full rounded-lg px-1 py-2 transition-colors hover:bg-vscode-blue"
                                >
                                  <span
                                    parent-id={'head'}
                                    typeof-item={'folder'}
                                    className="relative text-white"
                                  >
                                    New File
                                  </span>
                                </button>
                                <button
                                  parent-id={'head'}
                                  typeof-item={'folder'}
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    fileActions.newFolder();
                                  }}
                                  className="new-btns bg-vscode-overlay my-1 w-full rounded-lg  px-1 py-2 transition-colors hover:bg-vscode-blue"
                                >
                                  <span
                                    parent-id={'head'}
                                    typeof-item={'folder'}
                                    className="relative text-white"
                                  >
                                    New Folder
                                  </span>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    <div
                      parent-id={'head'}
                      typeof-item={'folder'}
                      className="clickable-padding min-h-[2rem] select-none"
                    >
                      &nbsp;
                    </div>
                  </div>
                  <div
                    parent-id={'head'}
                    typeof-item={'folder'}
                    className="clickable-padding min-h-[2rem] select-none"
                  >
                    &nbsp;
                  </div>
                </div>
              )}
            </div>
          </div>
          {showDialog &&
            createPortal(
              <Dialog
                title={`Delete the ${selectedType} ${contextSelectedItemProps.wholeName}?`}
                content={`Are you sure you want to delete the ${selectedType} /${contextSelectedItemProps.actualPath}? This action cannot be
            undone.`}
                actionText={`Yes, delete ${selectedType}`}
                close={setShowDialog}
                action={async () => {
                  dispatch(removeNode({ id: null, type: null }));
                  await dispatch(removeTabAsync());
                  await dispatch(setActiveEditorAsync({ id: '', line: 0 }));
                  setShowDialog(false);
                }}
              />,
              document.getElementById('root') as HTMLElement,
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
              document.getElementById('root') as HTMLElement,
            )}
        </div>
      ) : (
        <div className="flex h-full w-20 select-none flex-col items-center justify-start px-2">
          <Tooltip
            place="right-end"
            className="z-50"
            id="search"
            style={{ backgroundColor: 'rgb(60 60 60)' }}
          />

          <button
            onClick={() => {
              dispatch(setResizeCollapsed(false));
              dispatch(setSearchFocused(true));
            }}
            type="button"
            className="mb-3"
          >
            <img
              alt="search"
              data-tooltip-id="search"
              data-tooltip-content={'Search'}
              src="/search-icon.svg"
              className="h-14 w-14 rounded-md p-2 hover:bg-dark-hover"
            />
          </button>
          <hr className="w-5/6 border-t border-t-zinc-500" />
          <Tooltip
            place="right-start"
            className="z-50"
            id="file-explorer"
            style={{ backgroundColor: 'rgb(60 60 60)' }}
          />

          <button
            onClick={() => {
              dispatch(setResizeCollapsed(false));
              dispatch(setSearchFocused(false));
              // dispatch(search(""));
              setIsSearching(false);
            }}
            type="button"
            className="my-3"
          >
            <img
              alt="file explorer"
              data-tooltip-id="file-explorer"
              data-tooltip-content={'File Explorer'}
              src="/file-explorer.svg"
              className="h-14 w-14 rounded-md p-2 hover:bg-dark-hover"
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
          show={!!clickedRef.current && showInput}
          item={{
            type: inputType,
            rename: isRename
              ? {
                  wholeName:
                    thisItem.type === 'file'
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
                  item.type === 'file'
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
        appendTo.current as HTMLElement,
      )}
    </>
  );
};

export default Structure;
