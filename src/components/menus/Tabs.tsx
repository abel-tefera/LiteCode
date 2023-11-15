import React from "react";
import Tab from "./Tab";
import newProjectIcon from "../../assets/new-project.svg";
import uploadIcon from "../../assets/open-project.svg";

import { Tooltip } from "react-tooltip";
import { useTypedDispatch, useTypedSelector } from "../../state/hooks";

import { trimName } from "../file-structure/StructureUtils";
import { activeTabs, closeTab, selectTab } from "../../state/features/tabs/tabsSlice";

const Tabs = () => {
  const dispatch = useTypedDispatch();
  const tabs = useTypedSelector(activeTabs);

  const onSelect = (id: string) => {
    // alert(`Tab ${i} selected`);
    dispatch(selectTab(id));
  };

  const onClose = (id: string) => {
    dispatch(closeTab(id));
  };
  return (
    <div className="flex flex-row w-full justify-between">
      <div className={`file-tabs w-[80vw] md:max-w-[65vw] py-1`}>
        <div className="flex flex-row items-center w-full overflow-x-scroll custom-scrollbar">
          {tabs.map((item, i) => (
            <Tab
              id={item.id}
              name={item.wholeName}
              type={item.extension}
              selected={item.isSelected}
              onSelect={onSelect}
              onClose={onClose}
            />
          ))}
        </div>
      </div>
      <div className="flex items-center">
        <div className="p-2 mr-8 mb-3 md:mr-6 flex flex-row">
          <div className="mx-1">
            <Tooltip id="start-new-project" className="z-20" />
            <img
              data-tooltip-id="start-new-project"
              data-tooltip-content={"Start new Project"}
              src={newProjectIcon}
              alt="new project"
              className="w-5 h-5 object-cover md:w-8 md:h-8 md:p-1 cursor-pointer hover:bg-dark-hover rounded-sm"
            />
          </div>
          <div className="mx-1">
            <Tooltip id="open-existing-project" className="z-20" />
            <img
              data-tooltip-id="open-existing-project"
              data-tooltip-content={"Open existing Project"}
              src={uploadIcon}
              alt="open project"
              className="w-5 h-5 object-cover md:w-8 md:h-8 md:p-1 cursor-pointer hover:bg-dark-hover rounded-sm"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tabs;
