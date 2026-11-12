import { useRef, useState } from "react";

import { probeLabel } from "@/lib/probeLabel";
import type { BlastFx } from "@/lib/sceneTypes";
import type { CollisionFxEvent, Probe } from "@/lib/types";

export type LandingSession = {
  key: string;
  probeId: string | null;
  hideProbe: boolean;
  crash: CollisionFxEvent | null;
};

type SceneFx = "none" | "landing" | "collision";

type UseLandingSessionOptions = {
  setFx: (fx: SceneFx) => void;
  flash: (fx: "collision", ms: number) => void;
  clearFx: () => void;
  confirmLanding: (probeId: string) => void;
  setSelectedId: (id: string | null) => void;
  settleCollisionState: () => void | Promise<void>;
};

export function useLandingSession({
  setFx,
  flash,
  clearFx,
  confirmLanding,
  setSelectedId,
  settleCollisionState,
}: UseLandingSessionOptions) {
  const [session, setSession] = useState<LandingSession | null>(null);
  const [blast, setBlast] = useState<BlastFx | null>(null);
  const sessionRef = useRef<LandingSession | null>(null);
  sessionRef.current = session;

  function clearLanding() {
    setSession(null);
  }

  function triggerBlast(event: CollisionFxEvent) {
    clearLanding();
    setBlast({ key: Date.now(), x: event.x, y: event.y });
    flash("collision", 2200);
  }

  function startDelivery(probeId: string) {
    setFx("landing");
    setSession({
      key: probeId,
      probeId,
      hideProbe: true,
      crash: null,
    });
  }

  function startCrashLanding(event: CollisionFxEvent) {
    setFx("landing");
    setSession({
      key: `crash-${Date.now()}`,
      probeId: null,
      hideProbe: false,
      crash: event,
    });
  }

  function onCollision(event: CollisionFxEvent) {
    if (event.source === "landing") {
      startCrashLanding(event);
      return;
    }
    triggerBlast(event);
  }

  function onProbeDropped() {
    const current = sessionRef.current;
    if (!current) return;
    if (current.crash) {
      void settleCollisionState();
      setBlast({
        key: Date.now(),
        x: current.crash.x,
        y: current.crash.y,
      });
      flash("collision", 2200);
      return;
    }
    setSession({ ...current, hideProbe: false });
    if (current.probeId) {
      setSelectedId(current.probeId);
      confirmLanding(current.probeId);
    }
  }

  function onLandingComplete() {
    clearLanding();
    clearFx();
  }

  function resetSceneFx() {
    clearLanding();
    setBlast(null);
    clearFx();
  }

  return {
    session,
    blast,
    setBlast,
    landerActive: Boolean(session),
    clearLanding,
    resetSceneFx,
    startDelivery,
    onCollision,
    onProbeDropped,
    onLandingComplete,
    triggerBlast,
  };
}

export function landingStatusText(
  session: LandingSession | null,
  probes: Probe[],
  fallback: string,
) {
  if (!session) return fallback;
  if (session.crash) return "Descida em colisão…";
  if (!session.probeId) return fallback;
  const label = probeLabel(probes, session.probeId);
  if (session.hideProbe) return `${label} em pouso…`;
  return `${label} liberada — saída…`;
}
