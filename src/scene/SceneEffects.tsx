import { useMemo } from "react";
import {
  Bloom,
  ChromaticAberration,
  EffectComposer,
  Vignette,
} from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import { Vector2 } from "three";

export function SceneEffects() {
  const aberrationOffset = useMemo(() => new Vector2(0.00018, 0.00028), []);

  return (
    <EffectComposer multisampling={0}>
      <Bloom
        intensity={0.12}
        luminanceThreshold={0.72}
        luminanceSmoothing={0.88}
        mipmapBlur
      />
      <ChromaticAberration
        blendFunction={BlendFunction.NORMAL}
        offset={aberrationOffset}
      />
      <Vignette eskil={false} offset={0.14} darkness={0.4} />
    </EffectComposer>
  );
}
