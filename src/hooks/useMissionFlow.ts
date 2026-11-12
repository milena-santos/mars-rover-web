"use client";

import { useEffect, useMemo, useState } from "react";

import { useMissionState } from "@/hooks/useMissionState";
import { useTimedFx } from "@/hooks/useTimedFx";
import { parseMeshSize } from "@/lib/plateau";
import {
  clearStoredRegionId,
  getRegion,
  readStoredRegionId,
  storeRegionId,
  type MissionRegion,
} from "@/lib/regions";
import type { BlastFx, ScenePhase } from "@/scene/MissionScene";

export function useMissionFlow() {
  const [phase, setPhase] = useState<ScenePhase>("intro");
  const [regionId, setRegionId] = useState<string | null>(null);
  const [introLanding, setIntroLanding] = useState(false);
  const [introLanded, setIntroLanded] = useState(false);
  const [landerActive, setLanderActive] = useState(false);
  const [landingProbeId, setLandingProbeId] = useState<string | null>(null);
  const [blast, setBlast] = useState<BlastFx | null>(null);
  const [booted, setBooted] = useState(false);
  const [sceneReady, setSceneReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const { fx, setFx, flash, clearFx } = useTimedFx();

  const region = useMemo(() => getRegion(regionId), [regionId]);
  const regionLocked = phase === "setup-mesh" || phase === "mission";
  const showFlowHud = !introLanding && !landerActive;
  const showMissionHud = phase === "mission" && Boolean(region) && !introLanding;
  const showIntro = phase === "intro" && !introLanding;

  function releaseRegion() {
    clearStoredRegionId();
    setRegionId(null);
    setLanderActive(false);
    setLandingProbeId(null);
    setBlast(null);
    clearFx();
    setPhase("explore");
  }

  const mission = useMissionState({
    keyboardEnabled: phase === "mission" && !introLanding && !landerActive,
    onEmptyMission: releaseRegion,
    onLaunchSuccess: (probeId) => {
      setFx("landing");
      setLandingProbeId(probeId);
      setLanderActive(true);
    },
    onCollision: (event) => {
      setLanderActive(false);
      setLandingProbeId(null);
      setBlast({ key: Date.now(), x: event.x, y: event.y });
      flash("collision", 2200);
    },
  });

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

  function onMissionLandingComplete() {
    const id = landingProbeId;
    setLanderActive(false);
    setLandingProbeId(null);
    clearFx();
    if (id) {
      mission.setSelectedId(id);
      mission.confirmLanding(id);
    }
  }

  return {
    phase,
    region,
    mission,
    fx,
    loading,
    blast,
    introLanding,
    introLanded,
    landerActive,
    landingProbeId,
    regionLocked,
    showFlowHud,
    showMissionHud,
    showIntro,
    setPhase,
    setBlast,
    setSceneReady,
    startOperation,
    selectRegion,
    confirmMesh,
    backToRegionSelect,
    onIntroLandingComplete,
    onMissionLandingComplete,
    abandonMission: () => {
      void mission.abandonMission();
    },
  };
}
