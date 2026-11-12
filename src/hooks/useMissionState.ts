import { useRef, useState } from "react";

import { useMissionBootstrap } from "@/hooks/useMissionBootstrap";
import { usePilotQueue } from "@/hooks/usePilotQueue";
import { clearProbes, launchProbe } from "@/lib/api";
import { collisionStatus, humanizeApiError } from "@/lib/errors";
import { clearStoredPlateau, parseMeshSize, storePlateau } from "@/lib/plateau";
import { probeLabel } from "@/lib/probeLabel";
import type { CollisionFxEvent, Direction, Plateau, Probe } from "@/lib/types";

type UseMissionStateOptions = {
  keyboardEnabled: boolean;
  onEmptyMission?: () => void;
  onLaunchSuccess?: (probeId: string) => void;
  onCollision?: (event: CollisionFxEvent) => void;
};

export function useMissionState({
  keyboardEnabled,
  onEmptyMission,
  onLaunchSuccess,
  onCollision,
}: UseMissionStateOptions) {
  const [probes, setProbes] = useState<Probe[]>([]);
  const [plateau, setPlateau] = useState<Plateau | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [meshX, setMeshX] = useState("5");
  const [meshY, setMeshY] = useState("5");
  const [direction, setDirection] = useState<Direction>("NORTH");
  const [status, setStatus] = useState("Conectando…");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [apiOnline, setApiOnline] = useState(false);
  const [ready, setReady] = useState(false);

  const selectedIdRef = useRef(selectedId);
  const probesRef = useRef(probes);
  const plateauRef = useRef(plateau);
  const onEmptyMissionRef = useRef(onEmptyMission);
  const onLaunchSuccessRef = useRef(onLaunchSuccess);
  const onCollisionRef = useRef(onCollision);
  selectedIdRef.current = selectedId;
  probesRef.current = probes;
  plateauRef.current = plateau;
  onEmptyMissionRef.current = onEmptyMission;
  onLaunchSuccessRef.current = onLaunchSuccess;
  onCollisionRef.current = onCollision;

  useMissionBootstrap({
    setProbes,
    setPlateau,
    setSelectedId,
    setMeshX,
    setMeshY,
    setApiOnline,
    setStatus,
    setError,
    setReady,
  });

  const { queueRef, refreshProbes, handlePilotAction } = usePilotQueue({
    enabled: keyboardEnabled,
    selectedIdRef,
    probesRef,
    plateauRef,
    onCollisionRef,
    setProbes,
    setSelectedId,
    setApiOnline,
    setStatus,
    setError,
    setBusy,
  });

  async function landAtOrigin() {
    const x = plateau?.maxX ?? parseMeshSize(meshX);
    const y = plateau?.maxY ?? parseMeshSize(meshY);
    if (x === null || y === null) {
      setError("Limite X e Y precisam ser números inteiros ≥ 0.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const result = await launchProbe({ x, y, direction });
      const nextPlateau = { maxX: x, maxY: y };
      setPlateau(nextPlateau);
      storePlateau(nextPlateau);

      if (result.kind === "collision") {
        queueRef.current = [];
        const { x: cx, y: cy, destroyed } = result.collision;
        setStatus(collisionStatus("pouso", cx, cy, destroyed.length));
        onCollisionRef.current?.({
          x: cx,
          y: cy,
          destroyed,
          source: "landing",
        });
        return;
      }

      const nextProbes = await refreshProbes(result.probe.id);
      probesRef.current = nextProbes;
      setSelectedId(result.probe.id);
      setStatus(
        `${probeLabel(nextProbes, result.probe.id)} em descida para (0, 0).`,
      );
      onLaunchSuccessRef.current?.(result.probe.id);
    } catch (err) {
      setError(humanizeApiError(err, "Falha ao pousar sonda."));
    } finally {
      setBusy(false);
    }
  }

  async function abandonMission() {
    setBusy(true);
    setError(null);
    queueRef.current = [];
    try {
      await clearProbes();
      clearStoredPlateau();
      setProbes([]);
      setPlateau(null);
      setSelectedId(null);
      setStatus("Missão abandonada. Região liberada.");
      onEmptyMissionRef.current?.();
    } catch (err) {
      setError(humanizeApiError(err, "Falha ao abandonar a missão."));
    } finally {
      setBusy(false);
    }
  }

  function applyMeshDefaults(maxX: number, maxY: number) {
    setMeshX(String(maxX));
    setMeshY(String(maxY));
  }

  function lockMesh(maxX: number, maxY: number) {
    const nextPlateau = { maxX, maxY };
    setPlateau(nextPlateau);
    storePlateau(nextPlateau);
    setMeshX(String(maxX));
    setMeshY(String(maxY));
  }

  function confirmLanding(probeId: string) {
    setStatus(`${probeLabel(probesRef.current, probeId)} pousou em (0, 0).`);
  }

  async function settleCollisionState() {
    const nextProbes = await refreshProbes();
    probesRef.current = nextProbes;
    const selected = selectedIdRef.current;
    if (selected && !nextProbes.some((probe) => probe.id === selected)) {
      setSelectedId(nextProbes[0]?.id ?? null);
    }
  }

  const meshLocked = probes.length > 0 || plateau !== null;
  const parsedX = parseMeshSize(meshX);
  const parsedY = parseMeshSize(meshY);
  const draftPlateau: Plateau | null =
    parsedX !== null && parsedY !== null
      ? { maxX: parsedX, maxY: parsedY }
      : null;
  const visiblePlateau: Plateau | null = plateau ?? draftPlateau;

  return {
    probes,
    plateau,
    selectedId,
    setSelectedId,
    meshX,
    meshY,
    setMeshX,
    setMeshY,
    direction,
    setDirection,
    status,
    error,
    busy,
    apiOnline,
    ready,
    meshLocked,
    visiblePlateau,
    canLandAtOrigin: apiOnline && !busy && parsedX !== null && parsedY !== null,
    originOccupied: probes.some((probe) => probe.x === 0 && probe.y === 0),
    landAtOrigin,
    handlePilotAction,
    abandonMission,
    applyMeshDefaults,
    lockMesh,
    confirmLanding,
    settleCollisionState,
  };
}
