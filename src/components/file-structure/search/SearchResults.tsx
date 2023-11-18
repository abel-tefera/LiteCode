import React, { useState } from "react";
import ItemTitle from "../widgets/ItemTitle";
import downArrowLogo from "../../../assets/left-arrow.svg";
import HighlightedText from "./HighlightedText";

const SearchResults = () => {
  const [showResults, setShowResults] = useState(true);
  return (
    <div className="flex flex-col w-full">
      <div
        onClick={() => {
          setShowResults(!showResults);
        }}
        className="flex items-center w-full cursor-pointer hover:bg-dark-hover mb-2"
      >
        <img
          src={downArrowLogo}
          className={`${
            showResults ? "rotate-[270deg]" : "rotate-180"
          } transition-transform w-3 h-3 mx-2 self-center`}
          alt="Right Arrow"
        />
        <ItemTitle
          item={{
            id: "abcd",
            name: "test",
            type: "file",
            extension: "js",
          }}
          onClickE={() => {}}
        />
      </div>
      {showResults && (
        <div className="overflow-x-hidden">
          {Array(13)
            .fill(0)
            .map((_, i) => (
              <HighlightedText
                hightlight="brown"
                lineOfText="The quick brown fox jumped over the lazy dog"
              />
            ))}
        </div>
      )}
    </div>
  );
};

export default SearchResults;
