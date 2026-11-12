import { useEffect, useRef, useState } from "react";

type SceneFx = "none" | "landing" | "collision";

export function useTimedFx() {
  const [fx, setFx] = useState<SceneFx>("none");
  const timerRef = useRef<number | null>(null);

  function clearTimer() {
    if (timerRef.current === null) return;
    window.clearTimeout(timerRef.current);
    timerRef.current = null;
  }

  useEffect(() => () => clearTimer(), []);

  function flash(next: SceneFx, ms = 1600) {
    clearTimer();
    setFx(next);
    timerRef.current = window.setTimeout(() => {
      setFx("none");
      timerRef.current = null;
    }, ms);
  }

  function clearFx() {
    clearTimer();
    setFx("none");
  }

  return { fx, setFx, flash, clearFx };
}
