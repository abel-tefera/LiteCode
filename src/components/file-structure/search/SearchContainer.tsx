import React from "react";
import SearchResults from "./SearchResults";

const SearchContainer = () => {
  return (
    <div className="select-none w-full h-[25rem]">
      <div className="m-2 mb-4">1 result in 2 files</div>
      {Array(2)
        .fill(0)
        .map((_, i) => (
          <div className="w-full z-0">
            <SearchResults />
          </div>
        ))}
    </div>
  );
};

export default SearchContainer;
