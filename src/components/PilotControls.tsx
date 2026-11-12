import { cn } from "@/lib/cn";
import type { PilotAction } from "@/lib/pilot";

type PilotControlsProps = {
  disabled: boolean;
  onAction: (action: PilotAction) => void;
};

const KEYS: Array<{
  key: string;
  aria: string;
  action: PilotAction;
  turn?: boolean;
}> = [
  { key: "W", aria: "Norte", action: { type: "step", cardinal: "NORTH" } },
  { key: "A", aria: "Oeste", action: { type: "step", cardinal: "WEST" } },
  { key: "S", aria: "Sul", action: { type: "step", cardinal: "SOUTH" } },
  { key: "D", aria: "Leste", action: { type: "step", cardinal: "EAST" } },
  {
    key: "Q",
    aria: "Girar esquerda",
    action: { type: "turn", command: "L" },
    turn: true,
  },
  {
    key: "E",
    aria: "Girar direita",
    action: { type: "turn", command: "R" },
    turn: true,
  },
];

export function PilotControls({ disabled, onAction }: PilotControlsProps) {
  return (
    <section className="dock-module dock-pilot" aria-label="Pilotar">
      <div className="dock-module-head">
        <span className="dock-band-label">Piloto</span>
        <span className="dock-module-meta">WASD · QE</span>
      </div>
      <div className="dock-pilot-row">
        <div className="pilot-pad compact" aria-label="Teclas">
          {KEYS.map((item) => (
            <button
              key={item.key}
              type="button"
              className={cn("pilot-key", item.turn && "pilot-key-turn")}
              disabled={disabled}
              onClick={() => onAction(item.action)}
              aria-label={item.aria}
            >
              {item.key}
            </button>
          ))}
        </div>
        <span className="dock-help">
          <button
            type="button"
            className="dock-help-btn"
            aria-label="Ajuda dos controles"
          >
            ?
          </button>
          <span className="dock-help-tip" role="tooltip">
            <strong>Controles</strong>
            <span>WASD — move a sonda</span>
            <span>Q / E — gira esquerda / direita</span>
            <span>Pouso sempre em (0, 0)</span>
          </span>
        </span>
      </div>
    </section>
  );
}
