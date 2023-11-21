import React, { useEffect } from "react";
import SearchResults from "./SearchResults";
import { useTypedDispatch, useTypedSelector } from "../../../state/hooks";
import { getSearchResults, setSelected } from "../../../state/features/structure/structureSlice";
import { setActiveTabAsync } from "../../../state/features/tabs/tabsSlice";
import { setActiveEditorAsync } from "../../../state/features/editor/editorSlice";

const SearchContainer = () => {
  const searchData = useTypedSelector(getSearchResults);
  const dispatch = useTypedDispatch();
  return (
    <div className="select-none w-full h-fit">
      <div className="m-2">
        {searchData.numOfLines}{" "}result{searchData.numOfLines !== 1 && "s"}{" "}in
        {" "}{searchData.numOfResults}{" "}file{searchData.numOfResults !== 1 && "s"}
      </div>
      {searchData.files.map((file) => (
        <div className="w-full z-0">
          <SearchResults matchingFile={file} fileAtLineClick={(id, line) => {
             dispatch(setSelected({ id: id, type: "file" }));
             dispatch(setActiveTabAsync(id));
             dispatch(setActiveEditorAsync({id, line}));
            }} />
        </div>
      ))}
    </div>
  );
};

export default SearchContainer;
