export function MobileGate() {
  return (
    <div
      className="mobile-gate"
      role="dialog"
      aria-modal="true"
      aria-label="Tela incompatível"
    >
      <section className="mobile-gate-card glass">
        <p className="panel-kicker">Mission Control</p>
        <h2>Precisa de tela larga</h2>
        <p>
          Este controle de missão é feito para desktop ou tablet em paisagem.
          Abra em uma janela com pelo menos 1024px de largura.
        </p>
      </section>
    </div>
  );
}
