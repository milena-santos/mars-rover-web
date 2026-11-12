import {
  useRef,
  type Dispatch,
  type RefObject,
  type SetStateAction,
} from "react";

import { usePilotKeyboard } from "@/hooks/usePilotKeyboard";
import { listProbes, moveProbe } from "@/lib/api";
import { collisionStatus, humanizeApiError } from "@/lib/errors";
import {
  actionStaysInside,
  actionToCommands,
  type PilotAction,
} from "@/lib/pilot";
import { probeLabel } from "@/lib/probeLabel";
import type { CollisionFxEvent, Plateau, Probe } from "@/lib/types";

type PilotQueueOptions = {
  enabled: boolean;
  selectedIdRef: RefObject<string | null>;
  probesRef: RefObject<Probe[]>;
  plateauRef: RefObject<Plateau | null>;
  onCollisionRef: RefObject<((event: CollisionFxEvent) => void) | undefined>;
  setProbes: Dispatch<SetStateAction<Probe[]>>;
  setSelectedId: Dispatch<SetStateAction<string | null>>;
  setApiOnline: Dispatch<SetStateAction<boolean>>;
  setStatus: Dispatch<SetStateAction<string>>;
  setError: Dispatch<SetStateAction<string | null>>;
  setBusy: Dispatch<SetStateAction<boolean>>;
};

export function usePilotQueue({
  enabled,
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
}: PilotQueueOptions) {
  const queueRef = useRef<PilotAction[]>([]);
  const drainingRef = useRef(false);

  async function refreshProbes(preferredId?: string): Promise<Probe[]> {
    const response = await listProbes();
    setProbes(response.probes);
    setApiOnline(true);
    const nextSelected =
      preferredId ??
      selectedIdRef.current ??
      (response.probes.length > 0 ? response.probes[0].id : null);
    const stillExists = response.probes.some(
      (probe) => probe.id === nextSelected,
    );
    setSelectedId(
      stillExists ? nextSelected : (response.probes[0]?.id ?? null),
    );
    return response.probes;
  }

  async function drainQueue() {
    if (drainingRef.current) return;
    drainingRef.current = true;
    setBusy(true);

    while (queueRef.current.length > 0) {
      const probeId = selectedIdRef.current;
      const action = queueRef.current.shift();
      const probe = probesRef.current.find((item) => item.id === probeId);
      const plateau = plateauRef.current;
      if (!probeId || !action || !probe) {
        queueRef.current = [];
        continue;
      }

      if (plateau && !actionStaysInside(probe, action, plateau)) {
        setError("Fora da malha — movimento ignorado.");
        continue;
      }

      const commands = actionToCommands(probe, action);
      setError(null);
      try {
        const result = await moveProbe(probeId, commands);
        if (result.kind === "collision") {
          queueRef.current = [];
          const nextProbes = await refreshProbes();
          probesRef.current = nextProbes;
          const { x, y, destroyed } = result.collision;
          setStatus(collisionStatus("movimento", x, y, destroyed.length));
          onCollisionRef.current?.({ x, y, destroyed });
          continue;
        }

        const nextProbes = await refreshProbes(result.probe.id);
        probesRef.current = nextProbes;
        setStatus(
          `${probeLabel(nextProbes, result.probe.id)} agora em (${result.probe.x}, ${result.probe.y}).`,
        );
      } catch (err) {
        queueRef.current = [];
        setError(humanizeApiError(err, "Falha ao mover sonda."));
      }
    }

    drainingRef.current = false;
    setBusy(false);
  }

  function handlePilotAction(action: PilotAction) {
    if (!selectedIdRef.current) {
      setError("Selecione uma sonda antes de pilotar.");
      return;
    }
    const probe = probesRef.current.find(
      (item) => item.id === selectedIdRef.current,
    );
    const plateau = plateauRef.current;
    if (probe && plateau && !actionStaysInside(probe, action, plateau)) {
      setError("Fora da malha — movimento ignorado.");
      return;
    }
    queueRef.current.push(action);
    void drainQueue();
  }

  usePilotKeyboard({
    enabled,
    onAction: handlePilotAction,
  });

  return {
    queueRef,
    refreshProbes,
    handlePilotAction,
  };
}
