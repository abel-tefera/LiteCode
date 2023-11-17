import React from "react";
import Tab from "./Tab";

import { Tooltip } from "react-tooltip";
import { useTypedDispatch, useTypedSelector } from "../../state/hooks";

import { trimName } from "../file-structure/utils";
import { activeTabs, closeTab, selectTab } from "../../state/features/tabs/tabsSlice";
import { setActiveEditorAsync, removeActiveEditor } from "../../state/features/editor/editorSlice";

const Tabs = () => {
  const dispatch = useTypedDispatch();
  const tabs = useTypedSelector(activeTabs);

  const onSelect = (id: string) => {
    // alert(`Tab ${i} selected`);
    dispatch(selectTab(id));
    dispatch(setActiveEditorAsync(id))
    
  };

  const onClose = (id: string) => {
    dispatch(removeActiveEditor(id))

    dispatch(closeTab(id));
  };
  return (
    <div className="flex flex-row w-full justify-between">
      <div className={`file-tabs w-full py-1`}>
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

    </div>
  );
};

export default Tabs;
