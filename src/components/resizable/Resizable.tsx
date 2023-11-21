import React, { useEffect, useRef, useState } from "react";
import { ResizableBox, ResizableBoxProps } from "react-resizable";
import "../../styles/resizable.css";
import throttle from "../../utils/throttle";
import { useTypedSelector } from "../../state/hooks";
import { getEditorWidthAdjusted } from "../../state/features/editor/editorSlice";

interface ResizableProps {
  // direction: "horizontal" | "vertical";
  minRatio: number;
  maxRatio: number;
  children: React.ReactNode;
  initialRatio: number;
  resizableCall: (width: number) => void;
  haveWidthAdjusted: boolean;
  resizeStopCall: (width: number) => void;
}

const Resizable: React.FC<ResizableProps> = ({
  children,
  minRatio,
  maxRatio,
  initialRatio,
  resizableCall,
  haveWidthAdjusted,
  resizeStopCall
}) => {
  let resizableProps: ResizableBoxProps;

  const [innerWidth, setInnerWidth] = useState(window.innerWidth);
  const [innerHeight, setInnerHeight] = useState(window.innerHeight);

  const [resizableWidth, setResizableWidth] = useState(
    window.innerWidth * initialRatio
  );
  const widthAdjusted = useTypedSelector(getEditorWidthAdjusted);
  const prevCountRef = useRef<number>(widthAdjusted);

  useEffect(() => {
    if (!haveWidthAdjusted) return;
    const moveX = widthAdjusted - prevCountRef.current;
    if (resizableWidth + moveX < innerWidth * minRatio) return;
    if (resizableWidth + moveX > innerWidth * maxRatio) return;

    setResizableWidth(resizableWidth + moveX);
    prevCountRef.current = widthAdjusted;
  }, [widthAdjusted]);

  const containerRef = useRef<HTMLDivElement>(null);

  const handleResize = throttle((e: UIEvent) => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    setInnerWidth(width);
    setInnerHeight(height);
    if (window.innerWidth * maxRatio < resizableWidth) {
      setResizableWidth(window.innerWidth * maxRatio);
    }
  }, 500);

  useEffect(() => {
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // if (direction === "horizontal") {
  resizableProps = {
    axis: "x",
    className: `${haveWidthAdjusted && "rezisable"}`,
    width: resizableWidth,
    height: innerHeight * 0.7,
    // lockAspectRatio: true,
    resizeHandles: ["e"],
    minConstraints: [innerWidth * minRatio, Infinity],
    maxConstraints: [innerWidth * maxRatio, Infinity],
    // draggableOpts: { grid: [innerWidth * minRatio, Infinity] },
    onResize: (e, data) => {
      if (data.size.width < window.innerWidth * minRatio * 1.5) {
        // console.log("LOWER BOUNDS")
      }
      // console.log("ABCD", data)
      // if (hasResizableCall) {
        
        // console.log("DATA", data.size.width)
      resizableCall(data.size.width);
      // }
      if (data.handle === "w") {
        // console.log("WEST SIDE", data.size.width);
        // setResizableWidth();
      } else {
      }
    },
    onResizeStop: (e, data) => {
      setResizableWidth(data.size.width);
      resizeStopCall(data.size.width);
    },
  };
  // } else {
  //   resizableProps = {
  //     minConstraints: [Infinity, 24],
  //     maxConstraints: [Infinity, innerHeight * 0.9],
  //     height: 300,
  //     width: Infinity,
  //     resizeHandles: ["s"],
  //   };
  // }

  return (
    <div ref={containerRef}>
      <ResizableBox {...resizableProps}>{children}</ResizableBox>
    </div>
  );
};

export default Resizable;
