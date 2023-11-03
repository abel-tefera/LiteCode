import React from "react";
import Tab from "./Tab";
import downloadIcon from "../assets/down.jpg";
const Tabs = () => {
  const onSelect = (i: any) => {
    alert(`Tab ${i} selected`);
  };
  return (
    <div className="flex flex-row w-full justify-between">
      <div
        className={`lg:max-w-[44rem] xl:max-w-[60rem] 2xl:max-w-[64rem] my-1 flex flex-row items-center overflow-x-scroll custom-scrollbar`}
      >
        {Array(35)
          .fill(0)
          .map((_, i) => (
            <Tab
              id={i}
              name={"index.js"}
              type={"jsx"}
              selected={i === 3}
              onSelect={onSelect}
            />
          ))}
      </div>
      <div className="flex items-center self-center w-fit justify-end">

        <button>
          <img
            src={downloadIcon}
            className="h-7 w-7 mx-4 border border-white rounded-full hover:opacity-40 active:opacity-70 transition-opacity duration-300 ease-in-out"
            alt="Download Project"
          />
        </button>
      </div>
    </div>
  );
};

export default Tabs;
