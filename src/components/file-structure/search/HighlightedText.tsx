import React, { useEffect } from "react";
import { useTypedSelector } from "../../../state/hooks";
import { getEditorWidthAdjusted } from "../../../state/features/editor/editorSlice";

interface HighlightedTextProps {
  hightlight: string;
  lineOfText: string;
  lineNum: number;
  openAtLine: (lineNum: number) => void;
}
const HighlightedText: React.FC<HighlightedTextProps> = ({
  hightlight,
  lineOfText,
  lineNum,
  openAtLine
}) => {
  const widthAdjusted = useTypedSelector(getEditorWidthAdjusted);

  const parts = lineOfText.split(new RegExp(`(${hightlight})`, "gi"));
  const idx = parts.indexOf(hightlight);
  return (
    <div onClick={() => openAtLine(lineNum)} className="whitespace-nowrap my-1 ml-3 pl-1 cursor-pointer hover:bg-dark-hover">
      {parts.map((part, i) =>
        (() => {
          if (part === hightlight) {
            return <span className="bg-orange-400 text-black">{part}</span>;
          }
          if (idx > i && part.length > 5) {
            const factor = Math.abs(widthAdjusted / 10) + 5;
            let trimmedPart = part;
            if (part.length > factor) {
              trimmedPart = `...${part.substring(part.length - factor)}`;
            }
            return <span className="text-white">{trimmedPart}</span>;
          }
          return part;
        })()
      )}
    </div>
  );
};

export default HighlightedText;
