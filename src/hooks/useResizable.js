import { useState, useCallback, useRef, useEffect } from "react";

/**
 * useResizable — mouse-drag resize for sidebar panels.
 * @param {Object} opts
 * @param {number} opts.defaultWidth  - initial width in px
 * @param {number} opts.minWidth      - minimum resize limit
 * @param {number} opts.maxWidth      - maximum resize limit
 * @param {"left"|"right"} opts.side  - which side of the screen the panel is on
 * @returns {{ width, isDragging, handleMouseDown }}
 */
export default function useResizable({
  defaultWidth = 240,
  minWidth = 180,
  maxWidth = 420,
  side = "left",
}) {
  const [width, setWidth] = useState(defaultWidth);
  const isDragging = useRef(false);
  const [dragging, setDragging] = useState(false);
  const startX = useRef(0);
  const startW = useRef(0);

  const handleMouseDown = useCallback(
    (e) => {
      e.preventDefault();
      isDragging.current = true;
      setDragging(true);
      startX.current = e.clientX;
      startW.current = width;
    },
    [width],
  );

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging.current) return;
      const delta =
        side === "left"
          ? e.clientX - startX.current
          : startX.current - e.clientX;
      const newWidth = Math.min(
        maxWidth,
        Math.max(minWidth, startW.current + delta),
      );
      setWidth(newWidth);
    };

    const handleMouseUp = () => {
      if (isDragging.current) {
        isDragging.current = false;
        setDragging(false);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [minWidth, maxWidth, side]);

  return { width, isDragging: dragging, handleMouseDown };
}
