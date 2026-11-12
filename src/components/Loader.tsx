"use client";

import { useEffect, useState } from "react";

type LoaderProps = {
  visible: boolean;
};

export function Loader({ visible }: LoaderProps) {
  const [progress, setProgress] = useState(0);
  const [exiting, setExiting] = useState(false);
  const [mounted, setMounted] = useState(visible);

  useEffect(() => {
    if (visible) {
      setMounted(true);
      setExiting(false);
      setProgress(0);
      return;
    }
    if (!mounted) return;
    setExiting(true);
    const timer = window.setTimeout(() => setMounted(false), 900);
    return () => window.clearTimeout(timer);
  }, [visible, mounted]);

  useEffect(() => {
    if (!visible) return;

    const start = performance.now();
    let frame = 0;

    const tick = () => {
      const elapsed = performance.now() - start;
      setProgress(Math.min(95, (elapsed / 2200) * 95));
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [visible]);

  if (!mounted) return null;

  const label = Math.floor(progress).toString().padStart(2, "0");

  return (
    <div className={`boot-loader grain ${exiting ? "is-exiting" : ""}`}>
      <div className="boot-loader-frame" aria-hidden />
      <div className="boot-loader-inner">
        <div className="boot-loader-top">
          <span>MRV · 2026</span>
          <span>BOOT / SEQ-04</span>
        </div>

        <div className="boot-loader-center">
          <div className="boot-orbit" aria-hidden>
            <span className="boot-orbit-ring boot-orbit-ring-outer">
              <i />
            </span>
            <span className="boot-orbit-ring boot-orbit-ring-inner">
              <i />
            </span>
            <span className="boot-orbit-core" />
          </div>

          <div className="boot-loader-copy">
            <p className="boot-loader-title">Estabelecendo conexão com Marte</p>
            <p className="boot-loader-sub">
              Calibrando instrumentos · Renderizando atmosfera
            </p>
          </div>

          <div className="boot-loader-track" aria-hidden>
            <span style={{ width: `${progress}%` }} />
          </div>
          <p className="boot-loader-link">{label}% · LINK</p>
        </div>
      </div>
    </div>
  );
}
