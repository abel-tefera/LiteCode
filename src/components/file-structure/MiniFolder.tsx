import React from "react";
import ItemTitle from "./widgets/ItemTitle";
import CollapseBtn from "./widgets/CollapseBtn";
import {
  MiniStructure,
} from "../../state/features/structure/miniStructureSlice";
import { Identifier } from "../../state/features/structure/structureSlice";

interface MiniFolderProps {
  data: MiniStructure;
  init: boolean;
  onClickItem: (item: Identifier) => void;
  onCollapseMiniStructure: (id: string) => void;
}
const MiniFolder: React.FC<MiniFolderProps> = ({
  init,
  data,
  onClickItem,
  onCollapseMiniStructure,
}) => {
  const children = data.subFoldersAndFiles;

  return (
    <div className={`w-full h-fit`}>
      {children.map((item, i) => {
        return (
          <div className="flex flex-col select-none">
            <div
              className={`transition-colors flex flex-row hover:cursor-pointer hover:bg-dark-hover justify-between ${
                init && (i === 0
                  ? "rounded-t-lg"
                  : i === children.length - 1
                  ? "rounded-b-lg"
                  : "")
              }`}
            >
              <ItemTitle
                item={item}
                onClickE={(e) => {
                  onClickItem({ id: item.id, type: item.type });
                }}
              />
            </div>
            <>
              {item.type === "folder" && !item.collapsed && (
                <div className="flex flex-row sub-folder">
                  <CollapseBtn
                    item={item}
                    onClickE={() => {
                      onCollapseMiniStructure(item.id);
                    }}
                  />
                  <MiniFolder
                    init={false}
                    data={item}
                    onClickItem={onClickItem}
                    onCollapseMiniStructure={onCollapseMiniStructure}
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

export default MiniFolder;
