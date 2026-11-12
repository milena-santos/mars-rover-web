"use client";

import { MISSION_REGIONS, type MissionRegion } from "@/lib/regions";

type RegionPanelProps = {
  onSelect: (region: MissionRegion) => void;
};

export function RegionPanel({ onSelect }: RegionPanelProps) {
  return (
    <div className="ops-modal" role="dialog" aria-modal="true" aria-label="Região">
      <section className="ops-modal-card glass">
        <p className="panel-kicker">Região</p>
        <h2>Escolha o teatro</h2>
        <ul className="region-list">
          {MISSION_REGIONS.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                className="region-list-button"
                onClick={() => onSelect(item)}
              >
                <span style={{ color: item.color }}>{item.code}</span>
                <strong>{item.name}</strong>
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
