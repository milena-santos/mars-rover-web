"use client";

type IntroPanelProps = {
  onStart: () => void;
};

export function IntroPanel({ onStart }: IntroPanelProps) {
  return (
    <section className="hero-intro" onClick={onStart}>
      <div className="hero-intro-shell" onClick={(event) => event.stopPropagation()}>
        <div className="hero-intro-grid">
          <div className="hero-intro-main">
            <p className="eyebrow">Mars Rover · Mission Control</p>
            <h2>Coloque suas sondas em terreno inexplorado.</h2>
            <p className="hero-intro-lede">
              Revela a órbita, acompanha o pouso e abre as estações. Depois
              escolhe a região e lança as sondas no planalto.
            </p>
            <div className="hero-intro-actions">
              <button type="button" className="btn-mars" onClick={onStart}>
                Iniciar exploração
                <span aria-hidden>→</span>
              </button>
              <span className="hero-intro-hint">
                ↘ Explore as bases da superfície e as estações em órbita
              </span>
            </div>
          </div>

          <aside className="hero-intro-meta" aria-hidden>
            <span>LAT 14.5684° N · LON −175.4729°</span>
            <span className="hero-intro-meta-accent">MARTE · OBSERVATÓRIO ABERTO</span>
            <span>ATM 0.006 atm · −63°C média</span>
          </aside>
        </div>
      </div>
    </section>
  );
}
