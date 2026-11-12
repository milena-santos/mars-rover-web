"use client";

import { ExplorePanel } from "@/components/panels/ExplorePanel";
import { IntroPanel } from "@/components/panels/IntroPanel";
import { MobileGate } from "@/components/panels/MobileGate";
import { RegionPanel } from "@/components/panels/RegionPanel";
import { SetupPanel } from "@/components/panels/SetupPanel";
import { Loader } from "@/components/Loader";
import { MissionHud } from "@/components/MissionHud";
import { useMissionFlow } from "@/hooks/useMissionFlow";
import { cn } from "@/lib/cn";
import { probeLabel } from "@/lib/probeLabel";
import { MissionScene } from "@/scene/MissionScene";

export function Experience() {
  const flow = useMissionFlow();
  const { mission, region } = flow;

  return (
    <div className={cn("experience", flow.fx !== "none" && `fx-${flow.fx}`)}>
      <Loader visible={flow.loading} />
      <MobileGate />

      <MissionScene
        phase={flow.phase}
        region={region}
        regionLocked={flow.regionLocked}
        introLanding={flow.introLanding}
        introLanded={flow.introLanded}
        landerActive={flow.landerActive}
        landingProbeId={flow.landingProbeId}
        blast={flow.blast}
        probes={mission.probes}
        plateau={mission.visiblePlateau}
        selectedId={mission.selectedId}
        onSelectRegion={flow.selectRegion}
        onSelectProbe={(id) => mission.setSelectedId(id)}
        onIntroLandingComplete={flow.onIntroLandingComplete}
        onMissionLandingComplete={flow.onMissionLandingComplete}
        onBlastDone={() => flow.setBlast(null)}
        onReady={() => flow.setSceneReady(true)}
      />

      {flow.showIntro ? <div className="intro-veil" aria-hidden /> : null}

      <div className="experience-overlay">
        {!flow.introLanding ? (
          <header className="experience-top">
            <div className="brand-row">
              <span className="brand-mark" aria-hidden />
              <div className="brand-copy">
                <h1>Mars Rover</h1>
                <p className="brand-tagline">Mission Control · 03 / 26</p>
              </div>
            </div>
            {!flow.showIntro ? (
              <div className="status-chip" data-ready={mission.apiOnline}>
                <span className="status-dot" aria-hidden />
                <span>
                  {flow.landerActive && flow.landingProbeId
                    ? `${probeLabel(mission.probes, flow.landingProbeId)} em pouso…`
                    : mission.status}
                </span>
              </div>
            ) : null}
          </header>
        ) : null}

        {flow.showIntro ? <IntroPanel onStart={flow.startOperation} /> : null}
        {flow.showFlowHud && flow.phase === "explore" ? (
          <ExplorePanel onChooseRegion={() => flow.setPhase("select-region")} />
        ) : null}
        {flow.showFlowHud && flow.phase === "select-region" ? (
          <RegionPanel onSelect={flow.selectRegion} />
        ) : null}
        {flow.showFlowHud && flow.phase === "setup-mesh" && region ? (
          <SetupPanel
            region={region}
            meshX={mission.meshX}
            meshY={mission.meshY}
            onMeshXChange={mission.setMeshX}
            onMeshYChange={mission.setMeshY}
            onConfirm={flow.confirmMesh}
            onBack={flow.backToRegionSelect}
          />
        ) : null}
        {flow.showMissionHud && region ? (
          <MissionHud
            region={region}
            probes={mission.probes}
            selectedId={mission.selectedId}
            setSelectedId={mission.setSelectedId}
            direction={mission.direction}
            setDirection={mission.setDirection}
            busy={mission.busy || flow.landerActive}
            originOccupied={mission.originOccupied}
            visiblePlateau={mission.visiblePlateau}
            canLandAtOrigin={mission.canLandAtOrigin}
            error={mission.error}
            landAtOrigin={mission.landAtOrigin}
            handlePilotAction={mission.handlePilotAction}
            onAbandon={flow.abandonMission}
          />
        ) : null}
      </div>

      {flow.fx === "collision" ? (
        <div className="fx-flash fx-flash-blast" aria-hidden>
          <span>DESTRUÍDA</span>
        </div>
      ) : null}
    </div>
  );
}
