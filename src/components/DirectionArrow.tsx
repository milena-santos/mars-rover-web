import { directionDegrees } from "@/lib/directions";
import type { Direction } from "@/lib/types";

type DirectionArrowProps = {
  direction: Direction;
  className?: string;
};

export function DirectionArrow({
  direction,
  className = "",
}: DirectionArrowProps) {
  return (
    <svg
      className={`direction-arrow ${className}`.trim()}
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      aria-hidden
      style={{ transform: `rotate(${directionDegrees(direction)}deg)` }}
    >
      <path
        d="M12 3.2 18.4 14.8H13.6V20.8H10.4V14.8H5.6Z"
        fill="currentColor"
      />
    </svg>
  );
}
