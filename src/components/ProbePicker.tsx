"use client";

import { DirectionArrow } from "@/components/DirectionArrow";
import { cn } from "@/lib/cn";
import { directionLabel } from "@/lib/directions";
import { probeCaption } from "@/lib/probeLabel";
import type { Probe } from "@/lib/types";

type ProbePickerProps = {
  probes: Probe[];
  selectedId: string | null;
  onOpen: () => void;
};

type ProbePickerModalProps = {
  probes: Probe[];
  selectedId: string | null;
  onSelect: (probeId: string) => void;
  onClose: () => void;
};

export function ProbePicker({ probes, selectedId, onOpen }: ProbePickerProps) {
  const selectedIndex = probes.findIndex((probe) => probe.id === selectedId);
  const selected = selectedIndex >= 0 ? probes[selectedIndex] : null;

  return (
    <div className="dock-active-block">
      <span className="dock-band-label">Ativa</span>
      <button
        type="button"
        className="dock-active-trigger"
        disabled={probes.length === 0}
        aria-haspopup="dialog"
        onClick={onOpen}
      >
        {selected ? (
          <>
            <DirectionArrow direction={selected.direction} />
            <span>{probeCaption(selected, selectedIndex)}</span>
          </>
        ) : (
          <span>Nenhuma sonda</span>
        )}
        <span className="dock-active-dot" aria-hidden />
      </button>
    </div>
  );
}

export function ProbePickerModal({
  probes,
  selectedId,
  onSelect,
  onClose,
}: ProbePickerModalProps) {
  return (
    <div
      className="ops-modal"
      role="dialog"
      aria-modal="true"
      aria-label="Escolher sonda"
    >
      <section className="ops-modal-card glass">
        <p className="panel-kicker">Sondas</p>
        <h2>Escolher ativa</h2>
        {probes.length === 0 ? (
          <p>Nenhuma sonda lançada.</p>
        ) : (
          <ul className="probe-pick-list">
            {probes.map((probe, index) => (
              <li key={probe.id}>
                <button
                  type="button"
                  className={cn(
                    "probe-pick-row",
                    probe.id === selectedId && "is-active",
                  )}
                  onClick={() => {
                    onSelect(probe.id);
                    onClose();
                  }}
                >
                  <span className="probe-pick-glyph">
                    <DirectionArrow direction={probe.direction} />
                  </span>
                  <span>
                    <strong>{probeCaption(probe, index)}</strong>
                    <small>{directionLabel(probe.direction)}</small>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
        <button type="button" className="ghost-button" onClick={onClose}>
          Fechar
        </button>
      </section>
    </div>
  );
}
