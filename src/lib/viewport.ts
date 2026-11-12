/**
 * Insets for the part of the window that sits outside the reported work area.
 * Chrome on KDE Wayland often reports availHeight equal to the full screen and
 * omits availTop. Those reads stay unused. Nothing here substitutes a guessed
 * panel size.
 */
export type FrameMetrics = {
  screenY: number;
  outerWidth: number;
  outerHeight: number;
  screenWidth: number;
  screenHeight: number;
  availTop: number | null;
  availHeight: number;
};

export function appFrameInsets(metrics: FrameMetrics): {
  top: number;
  bottom: number;
} {
  const availTop = metrics.availTop;
  const reported =
    availTop !== null &&
    metrics.availHeight > 0 &&
    metrics.availHeight < metrics.screenHeight - 1;
  if (!reported || availTop === null) {
    return { top: 0, bottom: 0 };
  }

  const windowBottom = Math.min(
    metrics.screenHeight,
    metrics.screenY + metrics.outerHeight,
  );
  const top = Math.max(0, Math.round(availTop - metrics.screenY));
  const bottom = Math.max(
    0,
    Math.round(windowBottom - (availTop + metrics.availHeight)),
  );

  return { top, bottom };
}

function readAvailTop(screen: Screen): number | null {
  const value = (screen as Screen & { availTop?: number }).availTop;
  return typeof value === "number" ? value : null;
}

function readFrameMetrics(): FrameMetrics {
  return {
    screenY: window.screenY,
    outerWidth: window.outerWidth,
    outerHeight: window.outerHeight,
    screenWidth: window.screen.width,
    screenHeight: window.screen.height,
    availTop: readAvailTop(window.screen),
    availHeight: window.screen.availHeight,
  };
}

export function bindAppViewport() {
  const root = document.documentElement;

  function sync() {
    const insets = appFrameInsets(readFrameMetrics());
    root.style.setProperty("--app-top", `${insets.top}px`);
    root.style.setProperty("--app-bottom", `${insets.bottom}px`);
  }

  sync();
  window.addEventListener("resize", sync);
  window.visualViewport?.addEventListener("resize", sync);

  return () => {
    window.removeEventListener("resize", sync);
    window.visualViewport?.removeEventListener("resize", sync);
  };
}
