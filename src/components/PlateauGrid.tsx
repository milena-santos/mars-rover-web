"use client";

import { directionGlyph, shortId } from "@/lib/directions";
import type { Plateau, Probe } from "@/lib/types";

type PlateauGridProps = {
  plateau: Plateau | null;
  probes: Probe[];
  selectedId: string | null;
  onSelect: (probeId: string) => void;
};

export function PlateauGrid({
  plateau,
  probes,
  selectedId,
  onSelect,
}: PlateauGridProps) {
  if (!plateau) {
    return (
      <div className="plateau-empty">
        <p>
          Configure a malha e lance a primeira sonda para revelar o planalto.
        </p>
      </div>
    );
  }

  const columns = plateau.maxX + 1;
  const rows = plateau.maxY + 1;
  const probeByCell = new Map<string, Probe>();
  for (const probe of probes) {
    probeByCell.set(`${probe.x},${probe.y}`, probe);
  }

  const cells = [];
  let row = plateau.maxY;
  while (row >= 0) {
    let column = 0;
    while (column <= plateau.maxX) {
      const key = `${column},${row}`;
      const probe = probeByCell.get(key);
      const selected = probe?.id === selectedId;
      cells.push(
        <button
          key={key}
          type="button"
          className={`plateau-cell${probe ? " occupied" : ""}${selected ? " selected" : ""}`}
          disabled={!probe}
          onClick={() => {
            if (probe) onSelect(probe.id);
          }}
          aria-label={
            probe
              ? `Sonda ${shortId(probe.id)} em ${column}, ${row}, ${probe.direction}`
              : `Célula ${column}, ${row}`
          }
        >
          {probe ? (
            <span className="probe-marker" data-direction={probe.direction}>
              <span className="probe-glyph" aria-hidden>
                {directionGlyph(probe.direction)}
              </span>
              <span className="probe-id">{shortId(probe.id)}</span>
            </span>
          ) : null}
        </button>,
      );
      column += 1;
    }
    row -= 1;
  }

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
      <div className="plateau-meta">
        <span>
          Malha {plateau.maxX} × {plateau.maxY}
        </span>
        <span>
          {columns} × {rows} células
        </span>
      </div>
    </div>
  );
}
