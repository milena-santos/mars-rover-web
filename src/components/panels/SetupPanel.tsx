import { MAX_MESH_SIZE, parseMeshSize } from "@/lib/plateau";
import type { MissionRegion } from "@/lib/regions";

type SetupPanelProps = {
  region: MissionRegion;
  meshX: string;
  meshY: string;
  onMeshXChange: (value: string) => void;
  onMeshYChange: (value: string) => void;
  onConfirm: () => void;
  onBack: () => void;
};

export function SetupPanel({
  region,
  meshX,
  meshY,
  onMeshXChange,
  onMeshYChange,
  onConfirm,
  onBack,
}: SetupPanelProps) {
  const canConfirm =
    parseMeshSize(meshX) !== null && parseMeshSize(meshY) !== null;

  return (
    <div
      className="ops-modal"
      role="dialog"
      aria-modal="true"
      aria-label="Malha"
    >
      <section className="ops-modal-card glass">
        <p className="panel-kicker">{region.code}</p>
        <h2>{region.name}</h2>
        <p>Defina a malha do planalto (0–{MAX_MESH_SIZE} por eixo).</p>
        <div className="field-row">
          <label>
            Limite X
            <input
              inputMode="numeric"
              value={meshX}
              onChange={(event) => onMeshXChange(event.target.value)}
              autoFocus
            />
          </label>
          <label>
            Limite Y
            <input
              inputMode="numeric"
              value={meshY}
              onChange={(event) => onMeshYChange(event.target.value)}
            />
          </label>
        </div>
        <button
          type="button"
          className="cta-button"
          onClick={onConfirm}
          disabled={!canConfirm}
        >
          Abrir planalto
        </button>
        <button type="button" className="ghost-button" onClick={onBack}>
          Trocar região
        </button>
      </section>
    </div>
  );
}
