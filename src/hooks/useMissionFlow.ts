import { useEffect, useMemo, useRef, useState } from "react";

import {
  landingStatusText,
  useLandingSession,
} from "@/hooks/useLandingSession";
import { useMissionState } from "@/hooks/useMissionState";
import { useTimedFx } from "@/hooks/useTimedFx";
import { parseMeshSize } from "@/lib/plateau";
import {
  clearStoredRegionId,
  readStoredRegionId,
  storeRegionId,
} from "@/lib/regionStorage";
import { getRegion, type MissionRegion } from "@/lib/regions";
import type { ScenePhase } from "@/lib/sceneTypes";

export function useMissionFlow() {
  const [phase, setPhase] = useState<ScenePhase>("intro");
  const [regionId, setRegionId] = useState<string | null>(null);
  const [introLanding, setIntroLanding] = useState(false);
  const [introLanded, setIntroLanded] = useState(false);
  const [booted, setBooted] = useState(false);
  const [sceneReady, setSceneReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const { fx, setFx, flash, clearFx } = useTimedFx();

  const missionApiRef = useRef<{
    confirmLanding: (probeId: string) => void;
    setSelectedId: (id: string | null) => void;
    settleCollisionState: () => void | Promise<void>;
  }>({
    confirmLanding: () => {},
    setSelectedId: () => {},
    settleCollisionState: () => {},
  });

  const landing = useLandingSession({
    setFx,
    flash,
    clearFx,
    confirmLanding: (probeId) => missionApiRef.current.confirmLanding(probeId),
    setSelectedId: (id) => missionApiRef.current.setSelectedId(id),
    settleCollisionState: () => missionApiRef.current.settleCollisionState(),
  });

  const region = useMemo(() => getRegion(regionId), [regionId]);
  const regionLocked = phase === "setup-mesh" || phase === "mission";
  const showFlowHud = !introLanding && !landing.landerActive;
  const showMissionHud =
    phase === "mission" && Boolean(region) && !introLanding;
  const showIntro = phase === "intro" && !introLanding;

  function releaseRegion() {
    clearStoredRegionId();
    setRegionId(null);
    landing.resetSceneFx();
    setPhase("explore");
  }

  const mission = useMissionState({
    keyboardEnabled:
      phase === "mission" && !introLanding && !landing.landerActive,
    onEmptyMission: releaseRegion,
    onLaunchSuccess: landing.startDelivery,
    onCollision: landing.onCollision,
  });

  missionApiRef.current.confirmLanding = mission.confirmLanding;
  missionApiRef.current.setSelectedId = mission.setSelectedId;
  missionApiRef.current.settleCollisionState = mission.settleCollisionState;

  useEffect(() => {
    if (!sceneReady) return;
    const timeout = window.setTimeout(() => setLoading(false), 1400);
    return () => window.clearTimeout(timeout);
  }, [sceneReady]);

  useEffect(() => {
    if (booted || !mission.ready) return;
    setBooted(true);

    const stored = readStoredRegionId();
    if (mission.probes.length === 0 || !stored) return;

    setIntroLanded(true);
    setRegionId(stored);
    setPhase("mission");
  }, [booted, mission.probes.length, mission.ready]);

  function startOperation() {
    if (introLanding) return;
    if (introLanded) {
      setPhase("explore");
      return;
    }
    setIntroLanding(true);
  }

  function selectRegion(next: MissionRegion) {
    if (regionLocked || introLanding || phase !== "select-region") return;
    setRegionId(next.id);
    storeRegionId(next.id);
    if (mission.meshLocked) {
      setPhase("mission");
      return;
    }
    mission.applyMeshDefaults(next.defaultMaxX, next.defaultMaxY);
    setPhase("setup-mesh");
  }

  function confirmMesh() {
    const x = parseMeshSize(mission.meshX);
    const y = parseMeshSize(mission.meshY);
    if (x === null || y === null || !regionId) return;
    mission.lockMesh(x, y);
    setPhase("mission");
  }

  function backToRegionSelect() {
    clearStoredRegionId();
    setRegionId(null);
    setPhase("select-region");
  }

  function onIntroLandingComplete() {
    setIntroLanding(false);
    setIntroLanded(true);
    setPhase("explore");
  }

  return {
    phase,
    region,
    mission,
    fx,
    loading,
    blast: landing.blast,
    introLanding,
    introLanded,
    landingSession: landing.session,
    landerActive: landing.landerActive,
    regionLocked,
    showFlowHud,
    showMissionHud,
    showIntro,
    statusText: landingStatusText(
      landing.session,
      mission.probes,
      mission.status,
    ),
    setPhase,
    setBlast: landing.setBlast,
    setSceneReady,
    startOperation,
    selectRegion,
    confirmMesh,
    backToRegionSelect,
    onIntroLandingComplete,
    onMissionProbeDropped: landing.onProbeDropped,
    onMissionLandingComplete: landing.onLandingComplete,
    abandonMission: () => {
      void mission.abandonMission();
    },
  };
}
