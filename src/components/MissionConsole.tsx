"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";

import { ApiError, launchProbe, listProbes, moveProbe } from "@/lib/api";
import {
  DIRECTIONS,
  directionGlyph,
  directionLabel,
  shortId,
} from "@/lib/directions";
import type { Direction, Plateau, Probe } from "@/lib/types";
import { PlateauGrid } from "@/components/PlateauGrid";

const PLATEAU_STORAGE_KEY = "mars-rover.plateau";

function readStoredPlateau(): Plateau | null {
  if (typeof window === "undefined") return null;
  const raw = window.sessionStorage.getItem(PLATEAU_STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Plateau;
    if (
      typeof parsed.maxX === "number" &&
      typeof parsed.maxY === "number" &&
      parsed.maxX >= 0 &&
      parsed.maxY >= 0
    ) {
      return parsed;
    }
  } catch {
    return null;
  }
  return null;
}

function storePlateau(plateau: Plateau): void {
  window.sessionStorage.setItem(PLATEAU_STORAGE_KEY, JSON.stringify(plateau));
}

function inferPlateau(
  probes: Probe[],
  current: Plateau | null,
): Plateau | null {
  if (current) return current;
  if (probes.length === 0) return null;
  let maxX = 0;
  let maxY = 0;
  for (const probe of probes) {
    if (probe.x > maxX) maxX = probe.x;
    if (probe.y > maxY) maxY = probe.y;
  }
  return { maxX: Math.max(maxX, 5), maxY: Math.max(maxY, 5) };
}

export function MissionConsole() {
  const [probes, setProbes] = useState<Probe[]>([]);
  const [plateau, setPlateau] = useState<Plateau | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [meshX, setMeshX] = useState("5");
  const [meshY, setMeshY] = useState("5");
  const [direction, setDirection] = useState<Direction>("NORTH");
  const [commands, setCommands] = useState("MRM");
  const [status, setStatus] = useState("Conectando à API…");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      const stored = readStoredPlateau();
      try {
        const response = await listProbes();
        if (cancelled) return;
        setProbes(response.probes);
        const nextPlateau = inferPlateau(response.probes, stored);
        setPlateau(nextPlateau);
        if (nextPlateau) storePlateau(nextPlateau);
        if (response.probes.length > 0) {
          setSelectedId(response.probes[0].id);
        }
        setStatus("Missão sincronizada com a API.");
        setReady(true);
      } catch (err) {
        if (cancelled) return;
        const message =
          err instanceof ApiError
            ? err.message
            : "Não foi possível falar com a API.";
        setError(message);
        setStatus("API indisponível.");
        setPlateau(stored);
        setReady(true);
      }
    }

    void bootstrap();
    return () => {
      cancelled = true;
    };
  }, []);

  async function refreshProbes(preferredId?: string) {
    const response = await listProbes();
    setProbes(response.probes);
    const nextSelected =
      preferredId ??
      selectedId ??
      (response.probes.length > 0 ? response.probes[0].id : null);
    const stillExists = response.probes.some(
      (probe) => probe.id === nextSelected,
    );
    setSelectedId(
      stillExists ? nextSelected : (response.probes[0]?.id ?? null),
    );
    return response.probes;
  }

  async function onLaunch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const x = Number(meshX);
      const y = Number(meshY);
      const probe = await launchProbe({ x, y, direction });
      const nextPlateau = { maxX: x, maxY: y };
      setPlateau(nextPlateau);
      storePlateau(nextPlateau);
      await refreshProbes(probe.id);
      setSelectedId(probe.id);
      setStatus(`Sonda ${shortId(probe.id)} lançada em (0, 0).`);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Falha ao lançar sonda.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function onMove(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedId) {
      setError("Selecione uma sonda antes de enviar comandos.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const probe = await moveProbe(selectedId, commands.trim().toUpperCase());
      await refreshProbes(probe.id);
      setStatus(
        `Sonda ${shortId(probe.id)} agora em (${probe.x}, ${probe.y}) ${probe.direction}.`,
      );
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Falha ao mover sonda.");
    } finally {
      setBusy(false);
    }
  }

  const selected = probes.find((probe) => probe.id === selectedId) ?? null;

  return (
    <div className="mission-shell">
      <header className="mission-header">
        <div>
          <p className="eyebrow">RD Station · Desafio</p>
          <h1>Mars Rover Control</h1>
          <p className="lede">
            Configure a malha, lance sondas em (0, 0), envie comandos e
            acompanhe posição e direção no planalto.
          </p>
        </div>
        <div className="status-chip" data-ready={ready && !error}>
          <span className="status-dot" aria-hidden />
          <span>{status}</span>
        </div>
      </header>

      <div className="mission-layout">
        <section className="board-panel" aria-label="Planalto">
          <div className="panel-heading">
            <h2>Planalto</h2>
            <p>Células ocupadas mostram a direção atual da sonda.</p>
          </div>
          <PlateauGrid
            plateau={plateau}
            probes={probes}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
        </section>

        <aside className="control-panel" aria-label="Controles">
          <form className="control-card" onSubmit={onLaunch}>
            <div className="panel-heading">
              <h2>Lançar sonda</h2>
              <p>
                Define a malha (canto superior direito) e a direção inicial.
              </p>
            </div>
            <div className="field-row">
              <label>
                Malha X
                <input
                  inputMode="numeric"
                  min={0}
                  value={meshX}
                  onChange={(event) => setMeshX(event.target.value)}
                  required
                />
              </label>
              <label>
                Malha Y
                <input
                  inputMode="numeric"
                  min={0}
                  value={meshY}
                  onChange={(event) => setMeshY(event.target.value)}
                  required
                />
              </label>
            </div>
            <label>
              Direção
              <select
                value={direction}
                onChange={(event) =>
                  setDirection(event.target.value as Direction)
                }
              >
                {DIRECTIONS.map((item) => (
                  <option key={item} value={item}>
                    {directionGlyph(item)} {directionLabel(item)}
                  </option>
                ))}
              </select>
            </label>
            <button type="submit" disabled={busy}>
              Lançar em (0, 0)
            </button>
          </form>

          <form className="control-card" onSubmit={onMove}>
            <div className="panel-heading">
              <h2>Mover sonda</h2>
              <p>Comandos: M (avançar), L (esquerda), R (direita).</p>
            </div>
            <label>
              Sonda
              <select
                value={selectedId ?? ""}
                onChange={(event) => setSelectedId(event.target.value || null)}
                disabled={probes.length === 0}
              >
                {probes.length === 0 ? (
                  <option value="">Nenhuma sonda</option>
                ) : (
                  probes.map((probe) => (
                    <option key={probe.id} value={probe.id}>
                      {shortId(probe.id)} · ({probe.x}, {probe.y}){" "}
                      {directionGlyph(probe.direction)}
                    </option>
                  ))
                )}
              </select>
            </label>
            <label>
              Comandos
              <input
                value={commands}
                onChange={(event) =>
                  setCommands(event.target.value.toUpperCase())
                }
                placeholder="MRM"
                pattern="[MLRmlr]+"
                title="Use apenas M, L e R"
                required
              />
            </label>
            <button type="submit" disabled={busy || !selectedId}>
              Enviar sequência
            </button>
          </form>

          <section className="control-card roster">
            <div className="panel-heading">
              <h2>Sondas</h2>
              <p>{probes.length} em missão</p>
            </div>
            {probes.length === 0 ? (
              <p className="muted">Nenhuma sonda lançada ainda.</p>
            ) : (
              <ul className="probe-list">
                {probes.map((probe) => (
                  <li key={probe.id}>
                    <button
                      type="button"
                      className={`probe-row${probe.id === selectedId ? " active" : ""}`}
                      onClick={() => setSelectedId(probe.id)}
                    >
                      <span className="probe-row-glyph" aria-hidden>
                        {directionGlyph(probe.direction)}
                      </span>
                      <span>
                        <strong>{shortId(probe.id)}</strong>
                        <small>
                          ({probe.x}, {probe.y}) ·{" "}
                          {directionLabel(probe.direction)}
                        </small>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {selected ? (
              <p className="selected-note">
                Selecionada: {shortId(selected.id)} em ({selected.x},{" "}
                {selected.y})
              </p>
            ) : null}
          </section>

          {error ? (
            <div className="alert" role="alert">
              {error}
            </div>
          ) : null}
        </aside>
      </div>
    </div>
  );
}
