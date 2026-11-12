import { describe, expect, it } from "vitest";

import {
  MAX_MESH_SIZE,
  parseMeshSize,
  resolveMissionPlateau,
} from "@/lib/plateau";
import type { Probe } from "@/lib/types";

const probeAt = (x: number, y: number): Probe => ({
  id: "p1",
  x,
  y,
  direction: "NORTH",
});

describe("parseMeshSize", () => {
  it("accepts integers from 0 to the API maximum", () => {
    expect(parseMeshSize("0")).toBe(0);
    expect(parseMeshSize("5")).toBe(5);
    expect(parseMeshSize(String(MAX_MESH_SIZE))).toBe(MAX_MESH_SIZE);
  });

  it("rejects values above the API maximum", () => {
    expect(parseMeshSize(String(MAX_MESH_SIZE + 1))).toBeNull();
    expect(parseMeshSize("999")).toBeNull();
  });

  it("rejects negatives, decimals, and non-numeric input", () => {
    expect(parseMeshSize("-1")).toBeNull();
    expect(parseMeshSize("1.5")).toBeNull();
    expect(parseMeshSize("abc")).toBeNull();
    expect(parseMeshSize("")).toBeNull();
    expect(parseMeshSize("  ")).toBeNull();
    expect(parseMeshSize("01a")).toBeNull();
  });

  it("trims surrounding whitespace", () => {
    expect(parseMeshSize("  7  ")).toBe(7);
  });
});

describe("resolveMissionPlateau", () => {
  it("prefers the shared plateau from the API", () => {
    expect(
      resolveMissionPlateau(
        { maxX: 5, maxY: 5 },
        { maxX: 3, maxY: 3 },
        [probeAt(0, 1)],
      ),
    ).toEqual({ maxX: 5, maxY: 5 });
  });

  it("does not invent plateau size from probe positions", () => {
    expect(
      resolveMissionPlateau(null, null, [probeAt(0, 1)]),
    ).toBeNull();
  });

  it("falls back to stored plateau when probes exist and API has none", () => {
    expect(
      resolveMissionPlateau(null, { maxX: 8, maxY: 3 }, [probeAt(0, 1)]),
    ).toEqual({ maxX: 8, maxY: 3 });
  });

  it("clears stale stored plateau when the mission is empty", () => {
    expect(
      resolveMissionPlateau(null, { maxX: 5, maxY: 5 }, []),
    ).toBeNull();
  });
});
