import React, { useEffect, useRef, useState } from "react";
import { ResizableBox, type ResizableBoxProps } from "react-resizable";
import "../../styles/resizable.css";
import throttle from "../../utils/throttle";
import { useTypedDispatch, useTypedSelector } from "../../state/hooks";
import { getEditorWidthAdjusted } from "../../state/features/editor/editorSlice";
import {
  isResizeCollapsed,
  setResizeCollapsed,
} from "../../state/features/structure/structureSlice";

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
  resizeStopCall,
}) => {
  let resizableProps: ResizableBoxProps;
  const dispatch = useTypedDispatch();
  const [innerWidth, setInnerWidth] = useState(window.innerWidth);
  const [innerHeight, setInnerHeight] = useState(window.innerHeight);
  const [minWConstraints, setWMinConstraint] = useState(
    window.innerWidth * minRatio,
  );
  const [resizableWidth, setResizableWidth] = useState(
    window.innerWidth * initialRatio,
  );
  const widthAdjusted = useTypedSelector(getEditorWidthAdjusted);
  const prevCountRef = useRef<number>(widthAdjusted);
  const isCollapsed = useTypedSelector(isResizeCollapsed);

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
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // if (direction === "horizontal") {
  resizableProps = {
    axis: "x",
    className: `${haveWidthAdjusted && "rezisable"}`,
    width: resizableWidth,
    height: innerHeight - 120,
    // lockAspectRatio: true,
    resizeHandles: ["e"],
    minConstraints: [minWConstraints, Infinity],
    maxConstraints: [innerWidth * maxRatio, Infinity],
    // draggableOpts: { grid: [innerWidth * minRatio, Infinity] },
    onResize: (e, data) => {
      // e.preventDefault();
      // const event = e as MouseEvent;
      if (
        !haveWidthAdjusted &&
        data.size.width === window.innerWidth * minRatio &&
        // @ts-ignore
        e.clientX <= 80
      ) {
        // setResizableWidth(40);
        if (!isCollapsed) {
          dispatch(setResizeCollapsed(true));
        }
      } else if (!haveWidthAdjusted && data.size.width > 100) {
        // setResizableWidth(innerWidth * minRatio);
        if (isCollapsed) {
          dispatch(setResizeCollapsed(false));
        }
      }

      resizableCall(data.size.width);
    },
    onResizeStop: (e, data) => {
      setResizableWidth(data.size.width);
      resizeStopCall(data.size.width);
    },
  };

  useEffect(() => {
    if (!containerRef.current || haveWidthAdjusted) return;
    if (isCollapsed) {
      setWMinConstraint(80);
      setResizableWidth(80);
    } else {
      setWMinConstraint(innerWidth * minRatio);
      setResizableWidth(innerWidth * minRatio + 1);
    }
  }, [isCollapsed]);

  return (
    <div
      // className="h-full w-full"
      ref={containerRef}>
      <ResizableBox {...resizableProps}>{children}</ResizableBox>
    </div>
  );
};

export default Resizable;
