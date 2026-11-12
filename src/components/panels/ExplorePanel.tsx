"use client";

type ExplorePanelProps = {
  onChooseRegion: () => void;
};

export function ExplorePanel({ onChooseRegion }: ExplorePanelProps) {
  return (
    <div className="explore-dock">
      <p className="explore-dock-hint">Arraste para orbitar · zoom com o scroll</p>
      <button type="button" className="btn-mars" onClick={onChooseRegion}>
        Escolher região
        <span aria-hidden>→</span>
      </button>
    </div>
  );
}
