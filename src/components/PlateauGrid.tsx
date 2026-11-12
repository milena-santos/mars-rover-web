import { cn } from "@/lib/cn";
import { probeLabel } from "@/lib/probeLabel";
import type { Plateau, Probe } from "@/lib/types";

type PlateauGridProps = {
  plateau: Plateau | null;
  probes: Probe[];
  selectedId: string | null;
  canLandAtOrigin: boolean;
  onSelect: (probeId: string) => void;
  onLandAtOrigin: () => void;
};

function cellLabel(
  column: number,
  row: number,
  probes: Probe[],
  probe: Probe | undefined,
  landTarget: boolean,
): string {
  if (probe) {
    return `${probeLabel(probes, probe.id)} em ${column}, ${row}`;
  }
  if (landTarget) return "Pousar sonda em (0, 0)";
  return `Célula ${column}, ${row}`;
}

export function PlateauGrid({
  plateau,
  probes,
  selectedId,
  canLandAtOrigin,
  onSelect,
  onLandAtOrigin,
}: PlateauGridProps) {
  if (!plateau) {
    return (
      <div className="plateau-empty">
        <p>Defina a malha para ver o planalto.</p>
      </div>
    );
  }

  const columns = plateau.maxX + 1;
  const rows = plateau.maxY + 1;
  const probeByCell = new Map(
    probes.map((probe) => [`${probe.x},${probe.y}`, probe] as const),
  );

  const cells = Array.from({ length: columns * rows }, (_, index) => {
    const column = index % columns;
    const row = plateau.maxY - Math.floor(index / columns);
    const probe = probeByCell.get(`${column},${row}`);
    const isOrigin = column === 0 && row === 0;
    const landTarget = isOrigin && canLandAtOrigin;
    const clickable = Boolean(probe) || landTarget;

    return (
      <button
        key={`${column},${row}`}
        type="button"
        className={cn(
          "plateau-cell",
          probe && "occupied",
          probe?.id === selectedId && "selected",
          isOrigin && "origin",
          landTarget && "land-target",
        )}
        disabled={!clickable}
        onClick={() => {
          if (landTarget) onLandAtOrigin();
          else if (probe) onSelect(probe.id);
        }}
        aria-label={cellLabel(column, row, probes, probe, Boolean(landTarget))}
      >
        {probe ? (
          <span className="probe-marker" data-direction={probe.direction}>
            <span className="probe-id">
              {probes.findIndex((item) => item.id === probe.id) + 1}
            </span>
          </span>
        ) : null}
      </button>
    );
  });

  return (
    <div className="plateau-shell">
      <div
        className="plateau-grid"
        style={{
          gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
        }}
      >
        {cells}
      </div>
    </div>
  );
}
