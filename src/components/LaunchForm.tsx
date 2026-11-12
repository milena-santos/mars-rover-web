import { DirectionArrow } from "@/components/DirectionArrow";
import { cn } from "@/lib/cn";
import { DIRECTIONS, directionLabel } from "@/lib/directions";
import type { Direction } from "@/lib/types";

type LaunchFormProps = {
  direction: Direction;
  busy: boolean;
  originOccupied: boolean;
  canLand: boolean;
  onDirectionChange: (value: Direction) => void;
  onLand: () => void;
  onAbandon: () => void;
};

export function LaunchForm({
  direction,
  busy,
  originOccupied,
  canLand,
  onDirectionChange,
  onLand,
  onAbandon,
}: LaunchFormProps) {
  return (
    <section className="dock-module dock-launch" aria-label="Pouso">
      <div className="dock-module-head">
        <span className="dock-band-label">Pouso</span>
        <span className="dock-module-meta">slot 0,0</span>
      </div>
      <div className="dock-dir-block">
        <span className="dock-dir-hint">Orientação</span>
        <div className="dock-launch-row">
          <div
            className="dock-dir-pad"
            role="group"
            aria-label="Orientação da próxima sonda ao pousar"
          >
            {DIRECTIONS.map((item) => (
              <button
                key={item}
                type="button"
                className={cn(
                  "dock-dir-key",
                  item === direction && "is-active",
                )}
                disabled={busy}
                aria-pressed={item === direction}
                aria-label={`Ao pousar: ${directionLabel(item)}`}
                title={`Orientação ao pousar: ${directionLabel(item)}`}
                onClick={() => onDirectionChange(item)}
              >
                <DirectionArrow direction={item} />
              </button>
            ))}
          </div>
          <button
            type="button"
            className="dock-abandon"
            disabled={busy}
            onClick={onAbandon}
          >
            Abandonar
          </button>
        </div>
      </div>
      <button
        type="button"
        className="dock-land"
        disabled={busy || !canLand}
        onClick={onLand}
      >
        {originOccupied ? "Pousar · colisão" : "Pousar"}
      </button>
    </section>
  );
}
