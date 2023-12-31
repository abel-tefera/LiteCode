import React from "react";
import {
  collapseOrExpand,
  contextSelectedItem,
  selectedItem,
  contextClick,
  clipboard,
  setSelected,
  type Directory,
  type FileInFolder,
} from "../../state/features/structure/structureSlice";
import { type RootState } from "../../state/store";
import { useTypedDispatch, useTypedSelector } from "../../state/hooks";
import { setActiveTabAsync } from "../../state/features/tabs/tabsSlice";
import { setActiveEditorAsync } from "../../state/features/editor/editorSlice";
import CollapseBtn from "./widgets/CollapseBtn";
import ThreeDots from "./widgets/ThreeDots";
import ItemTitle from "./widgets/ItemTitle";

interface FolderProps {
  data: Array<Directory | FileInFolder>;
  showBlue: boolean;
  setShowBlue: React.Dispatch<React.SetStateAction<boolean>>;
  showGray: boolean;
  setShowGray: React.Dispatch<React.SetStateAction<boolean>>;
}

const Folder: React.FC<FolderProps> = ({
  data,
  showBlue,
  setShowBlue,
  showGray,
  setShowGray,
}) => {
  const dispatch = useTypedDispatch();
  const selected = useTypedSelector(selectedItem);
  const contextSelected = useTypedSelector(contextSelectedItem);
  const cutItem = useTypedSelector(clipboard);
  const children = useTypedSelector((state: RootState) => {
    const allData = data.map(({ id: itemId, type }) => {
      return state.structure.normalized[`${type}s`].byId[itemId];
    });
    return allData;
  });

  return (
    <div className={`${children.length > 0 && "w-full"}`}>
      {children.map(item => {
        return (
          <div key={item.id} className={"flex flex-col select-none mr-1 w-full"}>
            <div
              id={item.id}
              typeof-item={item.type}
              className={`mr-1 transition-colors flex flex-row hover:cursor-pointer rounded-r-sm clickable hover:bg-dark-hover justify-between  ${
                selected === item.id && showBlue
                  ? "bg-vscode-overlay hover:bg-vscode-blue"
                  : contextSelected === item.id && showGray
                    ? "bg-slate-700 hover:bg-slate-600"
                    : ""
              }  ${
                cutItem?.isCut && cutItem.id === item.id ? "opacity-50" : ""
              } }`}>
              <ItemTitle
                item={item}
                onClickE={e => {
                  e.stopPropagation();
                  dispatch(setSelected({ id: item.id, type: item.type }));
                  setShowBlue(true);
                  setShowGray(false);
                  if (item.type === "file") {
                    dispatch(setActiveTabAsync(item.id));
                    dispatch(setActiveEditorAsync({ id: item.id, line: 0 }));
                  } else {
                    dispatch(
                      collapseOrExpand({
                        item: { id: item.id, type: item.type },
                        collapse: true,
                      }),
                    );
                  }
                }}
              />
              <ThreeDots
                item={item}
                selected={selected}
                showBlue={showBlue}
                onClickE={e => {
                  e.stopPropagation();
                  setShowBlue(false);
                  setShowGray(true);
                  dispatch(
                    contextClick({
                      id: item.id,
                      type: item.type,
                      threeDot: { x: e.clientY, y: e.clientX },
                    }),
                  );
                }}
              />
            </div>
            <>
              <div id={`ghost-input-${item.id}`}></div>
              {item.type === "folder" && !item.collapsed && (
                <div className="flex flex-row sub-folder">
                  <CollapseBtn
                    item={item}
                    onClickE={e => {
                      e.stopPropagation();
                      setShowBlue(true);
                      setShowGray(false);
                      dispatch(setSelected({ id: item.id, type: item.type }));
                      dispatch(
                        collapseOrExpand({
                          item: { id: item.id, type: item.type },
                          collapse: true,
                        }),
                      );
                    }}
                  />
                  <Folder
                    data={(() => {
                      const childFolder = data.find(newItem => {
                        return newItem.id === item.id;
                      });
                      return childFolder?.subFoldersAndFiles as Directory[];
                    })()}
                    showBlue={showBlue}
                    setShowBlue={setShowBlue}
                    showGray={showGray}
                    setShowGray={setShowGray}
                  />
                </div>
              )}
            </>
          </div>
        );
      })}
    </div>
  );
};

export default Folder;
