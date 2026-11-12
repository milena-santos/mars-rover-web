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
  const meshLabel = visiblePlateau
    ? `${visiblePlateau.maxX}×${visiblePlateau.maxY}`
    : "—";

  return (
    <>
      <aside className="mission-dock glass" aria-label="Painel de controle">
        <header className="dock-head">
          <div className="dock-head-copy">
            <p className="panel-kicker">Controle de missão</p>
            <strong className="dock-site">{region.name}</strong>
          </div>
          <div className="dock-readouts" aria-hidden>
            <span className="dock-readout">
              <em>Malha</em>
              {meshLabel}
            </span>
            <span className="dock-readout">
              <em>Sondas</em>
              {probes.length}
            </span>
            <span
              className="dock-led"
              data-live={probes.length > 0 ? "on" : "off"}
            />
          </div>
        </header>

        <div className="dock-body">
          <section className="dock-module dock-map" aria-label="Planalto">
            <div className="dock-module-head">
              <span className="dock-band-label">Mapa</span>
              <span className="dock-module-meta">origem 0,0</span>
            </div>
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
      </aside>

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
