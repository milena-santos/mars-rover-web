import { ExplorePanel } from "@/components/panels/ExplorePanel";
import { IntroPanel } from "@/components/panels/IntroPanel";
import { MobileGate } from "@/components/panels/MobileGate";
import { RegionPanel } from "@/components/panels/RegionPanel";
import { SetupPanel } from "@/components/panels/SetupPanel";
import { Loader } from "@/components/Loader";
import { MissionHud } from "@/components/MissionHud";
import { useMissionFlow } from "@/hooks/useMissionFlow";
import { cn } from "@/lib/cn";
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
        landingSession={flow.landingSession}
        blast={flow.blast}
        probes={mission.probes}
        plateau={mission.visiblePlateau}
        selectedId={mission.selectedId}
        onSelectRegion={flow.selectRegion}
        onSelectProbe={(id) => mission.setSelectedId(id)}
        onIntroLandingComplete={flow.onIntroLandingComplete}
        onMissionProbeDropped={flow.onMissionProbeDropped}
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
                <span>{flow.statusText}</span>
              </div>
            ) : null}
          </header>
        ) : null}

        <div className="experience-stage">
          {flow.showIntro ? <IntroPanel onStart={flow.startOperation} /> : null}
          {flow.showFlowHud && flow.phase === "explore" ? (
            <ExplorePanel
              onChooseRegion={() => flow.setPhase("select-region")}
            />
          ) : null}
          {flow.showFlowHud && flow.phase === "select-region" ? (
            <RegionPanel
              onSelect={flow.selectRegion}
              onClose={() => flow.setPhase("explore")}
            />
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
        </div>

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
