import React from "react";
import Tab from "./Tab";
import downloadIcon from "../assets/down.jpg";
import { Tooltip } from "react-tooltip";
const Tabs = () => {
  const onSelect = (i: any) => {
    alert(`Tab ${i} selected`);
  };
  return (
    <div className="flex flex-row w-full justify-between">
      <div
        className={`w-[80vw] md:max-w-[65vw] my-1 flex flex-row items-center overflow-x-scroll custom-scrollbar`}
      >
        {Array(24)
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
    </div>
  );
};

export default Tabs;
