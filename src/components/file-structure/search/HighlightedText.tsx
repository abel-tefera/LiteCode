import React, { useEffect } from "react";
import { useTypedSelector } from "../../../state/hooks";
import { getEditorWidthAdjusted } from "../../../state/features/editor/editorSlice";

interface HighlightedTextProps {
  hightlight: string;
  lineOfText: string;
}
const HighlightedText: React.FC<HighlightedTextProps> = ({
  hightlight,
  lineOfText,
}) => {
  const widthAdjusted = useTypedSelector(getEditorWidthAdjusted);

  const parts = lineOfText.split(new RegExp(`(${hightlight})`, "gi"));
  const idx = parts.indexOf(hightlight);
  return (
    <div className="whitespace-nowrap my-1 pl-4 cursor-pointer hover:bg-dark-hover">
      {parts.map((part, i) =>
        (() => {
          if (part.toLowerCase() === hightlight.toLowerCase()) {
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
