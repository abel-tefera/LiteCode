import React from "react";
import Tab from "./Tab";
import newProjectIcon from "../../assets/new-project.png";
import uploadIcon from "../../assets/upload.png";

import { Tooltip } from "react-tooltip";

const Tabs = () => {
  const onSelect = (i: number) => {
    alert(`Tab ${i} selected`);
  };
  return (
    <div className="flex flex-row w-full justify-between">
      <div
        className={`w-[80vw] md:max-w-[65vw] my-1 flex flex-row items-center overflow-x-scroll custom-scrollbar`}
      >
        {Array(6)
          .fill(0)
          .map((_, i) => (
            <Tab
              id={i}
              name={"index.js"}
              type={(() => {
                const rand = Math.floor(Math.random() * 4);
                switch (rand) {
                  case 0:
                    return "js";
                  case 1:
                    return "jsx";
                  case 2:
                    return "css";
                  case 3:
                    return "md";
                  default:
                    return "js";
                }
              })()}
              selected={i === 3}
              onSelect={onSelect}
            />
          ))}
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
