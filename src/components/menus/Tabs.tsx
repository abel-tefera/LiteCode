import React, { useEffect, useRef } from 'react';
import Tab from './Tab';

import { useTypedDispatch, useTypedSelector } from '../../state/hooks';

import {
  activeTabs,
  closeTab,
  selectTab,
  selectedTab,
  shouldTabsScroll,
} from '../../state/features/tabs/tabsSlice';
import { setActiveEditorAsync } from '../../state/features/editor/editorSlice';

const Tabs = () => {
  const dispatch = useTypedDispatch();
  const tabs = useTypedSelector(activeTabs);
  const selected = useTypedSelector(selectedTab);
  const tabsArea = useRef<HTMLDivElement>(null);
  const shouldScroll = useTypedSelector(shouldTabsScroll);

  const onSelect = (id: string) => {
    if (selected !== id) {
      dispatch(selectTab(id));
      dispatch(setActiveEditorAsync({ id, line: 0 }));
    }
  };

  const onClose = async (id: string) => {
    dispatch(closeTab(id));
    await dispatch(setActiveEditorAsync({ id: '', line: 0 }));
  };

  useEffect(() => {
    if (!tabsArea.current) return;
    tabsArea.current.scrollLeft = tabsArea.current.scrollWidth;
  }, [tabs.length]);

  useEffect(() => {
    // if (!tabsArea.current) return;
    if (shouldScroll) {
      const element = document.getElementById(`tab-${selected}`);
      element?.scrollIntoView({ behavior: 'instant', inline: 'center' });
    }
    // tabsArea.current.scrollLeft = tabsArea.current.scrollWidth;
  }, [shouldScroll, selected]);

  return (
    <div className="flex w-full flex-row">
      <div className={'file-tabs w-full py-1'}>
        <div
          ref={tabsArea}
          className="custom-scrollbar flex w-full flex-row items-center overflow-x-scroll"
        >
          {tabs.map((item, i) => (
            <Tab
              key={`tab-${item.id}`}
              id={item.id}
              name={item.wholeName}
              type={item.extension}
              selected={item.id === selected}
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
