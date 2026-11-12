import { Canvas } from "@react-three/fiber";
import { Suspense, useMemo } from "react";

import type { LandingSession } from "@/hooks/useLandingSession";
import {
  INTRO_LANDING,
  resolveSceneCamera,
  VEILED_CAMERA,
} from "@/lib/cameras";
import type { MissionRegion } from "@/lib/regions";
import type { BlastFx, ScenePhase } from "@/lib/sceneTypes";
import { plateauToWorld } from "@/lib/surfaceMath";
import type { Plateau, Probe } from "@/lib/types";
import { CameraRig } from "@/scene/CameraRig";
import { CollisionBurst } from "@/scene/CollisionBurst";
import { DustField } from "@/scene/DustField";
import { LandingShip } from "@/scene/LandingShip";
import { MarsPlanet } from "@/scene/MarsPlanet";
import { OrbitalFleet } from "@/scene/OrbitalFleet";
import { ProbeMarkers } from "@/scene/ProbeMarkers";
import { RegionMarkers } from "@/scene/RegionMarkers";
import { SceneEffects } from "@/scene/SceneEffects";
import { Starfield } from "@/scene/Starfield";

type MissionSceneProps = {
  phase: ScenePhase;
  region: MissionRegion | null;
  regionLocked: boolean;
  introLanding: boolean;
  introLanded: boolean;
  landingSession: LandingSession | null;
  blast: BlastFx | null;
  probes: Probe[];
  plateau: Plateau | null;
  selectedId: string | null;
  onSelectRegion: (region: MissionRegion) => void;
  onSelectProbe: (id: string) => void;
  onIntroLandingComplete: () => void;
  onMissionProbeDropped: () => void;
  onMissionLandingComplete: () => void;
  onBlastDone: () => void;
  onReady?: () => void;
};

export function MissionScene({
  phase,
  region,
  regionLocked,
  introLanding,
  introLanded,
  landingSession,
  blast,
  probes,
  plateau,
  selectedId,
  onSelectRegion,
  onSelectProbe,
  onIntroLandingComplete,
  onMissionProbeDropped,
  onMissionLandingComplete,
  onBlastDone,
  onReady,
}: MissionSceneProps) {
  const veiled = phase === "intro" && !introLanding;
  const picking = phase === "select-region";
  const inMission = phase === "mission";
  const landerActive = Boolean(landingSession);
  const orbitEnabled =
    !introLanding &&
    (phase === "explore" || picking || inMission || landerActive);
  const focused = useMemo(
    () =>
      resolveSceneCamera({
        veiled,
        introLanding,
        mission: inMission,
        region,
      }),
    [veiled, introLanding, inMission, region],
  );

  const missionTouchdown = useMemo(() => {
    if (!region || !plateau) return null;
    const touchdown = plateauToWorld(region, plateau, 0, 0, 0.002);
    const normal = touchdown.clone().normalize();
    return { touchdown, normal };
  }, [plateau, region]);

  const blastWorld = useMemo(() => {
    if (!blast || !region || !plateau) return null;
    const point = plateauToWorld(region, plateau, blast.x, blast.y, 0.02);
    const normal = point.clone().normalize();
    return {
      position: point.toArray() as [number, number, number],
      normal: normal.toArray() as [number, number, number],
    };
  }, [blast, plateau, region]);

  return (
    <div className="mission-canvas">
      <Canvas
        camera={{
          position: VEILED_CAMERA.position,
          fov: 42,
          near: 0.1,
          far: 220,
        }}
        dpr={[1, 1.75]}
        gl={{ antialias: true, powerPreference: "high-performance" }}
        onCreated={() => onReady?.()}
      >
        <color attach="background" args={["#020208"]} />
        <fog
          attach="fog"
          args={["#020208", veiled ? 16 : 22, veiled ? 48 : 55]}
        />
        <ambientLight intensity={veiled ? 0.14 : 0.2} color="#f6cfaa" />
        <directionalLight
          position={[6, 4.5, 2]}
          intensity={veiled ? 1.05 : 1.7}
          color="#ffdcb8"
        />
        <directionalLight
          position={[-4, -1.5, -3]}
          intensity={veiled ? 0.22 : 0.42}
          color="#91a6bf"
        />
        <Suspense fallback={null}>
          <Starfield />
          <DustField />
          <MarsPlanet spinning={veiled} />
          <OrbitalFleet dimmed={inMission && Boolean(region)} />
          <RegionMarkers
            selectedId={region?.id ?? null}
            locked={!picking || regionLocked || introLanding}
            showLabels={picking || phase === "explore"}
            onSelect={onSelectRegion}
          />
          {region && plateau && inMission ? (
            <ProbeMarkers
              region={region}
              plateau={plateau}
              probes={probes}
              selectedId={selectedId}
              hiddenId={
                landingSession?.hideProbe ? landingSession.probeId : null
              }
              onSelect={onSelectProbe}
            />
          ) : null}
          <LandingShip
            variant="insight"
            lat={INTRO_LANDING.lat}
            lon={INTRO_LANDING.lon}
            active={introLanding}
            parked={introLanded}
            onComplete={onIntroLandingComplete}
          />
          {landingSession && missionTouchdown ? (
            <LandingShip
              key={landingSession.key}
              variant="probe"
              active
              crash={Boolean(landingSession.crash)}
              touchdown={missionTouchdown.touchdown}
              normal={missionTouchdown.normal}
              onDrop={onMissionProbeDropped}
              onComplete={onMissionLandingComplete}
            />
          ) : null}
          {blast && blastWorld ? (
            <CollisionBurst
              key={blast.key}
              position={blastWorld.position}
              normal={blastWorld.normal}
              onDone={onBlastDone}
            />
          ) : null}
          <SceneEffects />
        </Suspense>
        <CameraRig
          position={focused.position}
          target={focused.target}
          orbitEnabled={orbitEnabled}
          fov={introLanding ? 37 : 42}
        />
      </Canvas>
    </div>
  );
}
