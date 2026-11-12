"use client";

import { useEffect, type Dispatch, type SetStateAction } from "react";

import { listProbes } from "@/lib/api";
import { humanizeApiError } from "@/lib/errors";
import {
  inferPlateau,
  readStoredPlateau,
  storePlateau,
} from "@/lib/plateau";
import type { Plateau, Probe } from "@/lib/types";

type BootstrapArgs = {
  setProbes: Dispatch<SetStateAction<Probe[]>>;
  setPlateau: Dispatch<SetStateAction<Plateau | null>>;
  setSelectedId: Dispatch<SetStateAction<string | null>>;
  setMeshX: Dispatch<SetStateAction<string>>;
  setMeshY: Dispatch<SetStateAction<string>>;
  setApiOnline: Dispatch<SetStateAction<boolean>>;
  setStatus: Dispatch<SetStateAction<string>>;
  setError: Dispatch<SetStateAction<string | null>>;
  setReady: Dispatch<SetStateAction<boolean>>;
};

export function useMissionBootstrap({
  setProbes,
  setPlateau,
  setSelectedId,
  setMeshX,
  setMeshY,
  setApiOnline,
  setStatus,
  setError,
  setReady,
}: BootstrapArgs) {
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
        if (nextPlateau) {
          storePlateau(nextPlateau);
          setMeshX(String(nextPlateau.maxX));
          setMeshY(String(nextPlateau.maxY));
        }
        if (response.probes.length > 0) {
          setSelectedId(response.probes[0].id);
        }
        setApiOnline(true);
        setStatus("Controle online");
      } catch (err) {
        if (cancelled) return;
        setApiOnline(false);
        setError(humanizeApiError(err, "Falha de conexão com o controle."));
        setStatus("Controle offline");
        setPlateau(stored);
        if (stored) {
          setMeshX(String(stored.maxX));
          setMeshY(String(stored.maxY));
        }
      } finally {
        if (!cancelled) setReady(true);
      }
    }

    void bootstrap();
    return () => {
      cancelled = true;
    };
  }, []);
}
