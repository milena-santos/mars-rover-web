import { describe, expect, it } from "vitest";

import { appFrameInsets, type FrameMetrics } from "@/lib/viewport";

const screen: FrameMetrics = {
  screenY: 0,
  outerWidth: 1366,
  outerHeight: 738,
  screenWidth: 1366,
  screenHeight: 768,
  availTop: 0,
  availHeight: 738,
};

describe("appFrameInsets", () => {
  it("leaves a maximized window that already ends at the work area", () => {
    expect(appFrameInsets(screen)).toEqual({ top: 0, bottom: 0 });
  });

  it("insets the strip of a window that covers a reported bottom panel", () => {
    expect(appFrameInsets({ ...screen, outerHeight: 768 })).toEqual({
      top: 0,
      bottom: 30,
    });
  });

  it("insets a reported top panel without moving the bottom", () => {
    expect(
      appFrameInsets({
        ...screen,
        availTop: 40,
        availHeight: 728,
        outerHeight: 768,
      }),
    ).toEqual({ top: 40, bottom: 0 });
  });

  it("ignores a floating window that stays inside the work area", () => {
    expect(
      appFrameInsets({
        ...screen,
        screenY: 80,
        outerWidth: 900,
        outerHeight: 500,
      }),
    ).toEqual({ top: 0, bottom: 0 });
  });

  it("does not invent a panel when Wayland reports the full screen and the window is already shorter", () => {
    expect(
      appFrameInsets({
        ...screen,
        availHeight: 768,
        outerHeight: 738,
      }),
    ).toEqual({ top: 0, bottom: 0 });
  });

  it("does not invent an inset when the work area is the full screen", () => {
    expect(
      appFrameInsets({
        ...screen,
        availHeight: 768,
        outerHeight: 768,
      }),
    ).toEqual({ top: 0, bottom: 0 });
  });

  it("does not invent an inset when availTop was not reported", () => {
    expect(appFrameInsets({ ...screen, availTop: null })).toEqual({
      top: 0,
      bottom: 0,
    });
  });

  it("does not clear the edge of a short window when the screen API is lying", () => {
    expect(
      appFrameInsets({
        ...screen,
        availHeight: 768,
        outerWidth: 900,
        outerHeight: 600,
      }),
    ).toEqual({ top: 0, bottom: 0 });
  });
});
