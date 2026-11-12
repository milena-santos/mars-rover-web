import { useState } from "react";

import { LaunchForm } from "@/components/LaunchForm";
import { PilotControls } from "@/components/PilotControls";
import { PlateauGrid } from "@/components/PlateauGrid";
import { ProbePicker, ProbePickerModal } from "@/components/ProbePicker";
import type { PilotAction } from "@/lib/pilot";
import type { MissionRegion } from "@/lib/regions";
import type { Direction, Plateau, Probe } from "@/lib/types";

type MissionHudProps = {
  region: MissionRegion;
  probes: Probe[];
  selectedId: string | null;
  setSelectedId: (id: string | null) => void;
  direction: Direction;
  setDirection: (value: Direction) => void;
  busy: boolean;
  originOccupied: boolean;
  visiblePlateau: Plateau | null;
  canLandAtOrigin: boolean;
  error: string | null;
  landAtOrigin: () => void;
  handlePilotAction: (action: PilotAction) => void;
  onAbandon: () => void;
};

export function MissionHud({
  region,
  probes,
  selectedId,
  setSelectedId,
  direction,
  setDirection,
  busy,
  originOccupied,
  visiblePlateau,
  canLandAtOrigin,
  error,
  landAtOrigin,
  handlePilotAction,
  onAbandon,
}: MissionHudProps) {
  const [confirmAbandon, setConfirmAbandon] = useState(false);
  const [probeModalOpen, setProbeModalOpen] = useState(false);

  return (
    <>
      <div className="mission-dock glass">
        <div className="dock-head">
          <p className="panel-kicker">{region.name}</p>
          <span>
            {visiblePlateau
              ? `${visiblePlateau.maxX}×${visiblePlateau.maxY}`
              : "—"}
          </span>
        </div>

        <div className="dock-body">
          <section className="dock-map" aria-label="Planalto">
            <PlateauGrid
              plateau={visiblePlateau}
              probes={probes}
              selectedId={selectedId}
              canLandAtOrigin={canLandAtOrigin}
              onSelect={setSelectedId}
              onLandAtOrigin={() => {
                void landAtOrigin();
              }}
            />
          </section>

          <div className="dock-controls">
            <LaunchForm
              direction={direction}
              busy={busy}
              originOccupied={originOccupied}
              canLand={canLandAtOrigin}
              onDirectionChange={setDirection}
              onLand={() => {
                void landAtOrigin();
              }}
              onAbandon={() => setConfirmAbandon(true)}
            />
            <PilotControls
              disabled={!selectedId || busy}
              onAction={handlePilotAction}
            />
            <ProbePicker
              probes={probes}
              selectedId={selectedId}
              onOpen={() => setProbeModalOpen(true)}
            />
          </div>
        </div>

        {error ? (
          <div className="alert" role="alert">
            {error}
          </div>
        ) : null}
      </div>

      {probeModalOpen ? (
        <ProbePickerModal
          probes={probes}
          selectedId={selectedId}
          onSelect={setSelectedId}
          onClose={() => setProbeModalOpen(false)}
        />
      ) : null}

      {confirmAbandon ? (
        <div
          className="ops-modal"
          role="dialog"
          aria-modal="true"
          aria-label="Abandonar"
        >
          <section className="ops-modal-card glass">
            <p className="panel-kicker">Missão</p>
            <h2>Abandonar missão?</h2>
            <p>Todas as sondas serão retiradas e a região será liberada.</p>
            <button
              type="button"
              className="cta-button"
              disabled={busy}
              onClick={() => {
                setConfirmAbandon(false);
                onAbandon();
              }}
            >
              Confirmar abandono
            </button>
            <button
              type="button"
              className="ghost-button"
              disabled={busy}
              onClick={() => setConfirmAbandon(false)}
            >
              Continuar missão
            </button>
          </section>
        </div>
      ) : null}
    </>
  );
}
