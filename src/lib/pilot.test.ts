import { describe, expect, it } from "vitest";

import {
  actionStaysInside,
  actionToCommands,
  isInsidePlateau,
  keyToCardinal,
  keyToTurn,
  stepTarget,
} from "@/lib/pilot";
import type { Plateau, Probe } from "@/lib/types";

const plateau: Plateau = { maxX: 5, maxY: 5 };

function probe(partial: Partial<Probe> = {}): Probe {
  return {
    id: "probe-1",
    x: 0,
    y: 0,
    direction: "NORTH",
    ...partial,
  };
}

describe("isInsidePlateau", () => {
  it("mirrors API plateau.contains inclusive bounds", () => {
    expect(isInsidePlateau(0, 0, plateau)).toBe(true);
    expect(isInsidePlateau(5, 5, plateau)).toBe(true);
    expect(isInsidePlateau(-1, 0, plateau)).toBe(false);
    expect(isInsidePlateau(0, 6, plateau)).toBe(false);
  });
});

describe("actionStaysInside", () => {
  it("allows turns anywhere", () => {
    expect(
      actionStaysInside(
        probe({ x: 5, y: 5 }),
        { type: "turn", command: "L" },
        plateau,
      ),
    ).toBe(true);
  });

  it("blocks steps that would leave the plateau", () => {
    expect(
      actionStaysInside(
        probe({ x: 0, y: 0, direction: "WEST" }),
        { type: "step", cardinal: "WEST" },
        plateau,
      ),
    ).toBe(false);
    expect(
      actionStaysInside(
        probe({ x: 0, y: 0, direction: "NORTH" }),
        { type: "step", cardinal: "NORTH" },
        plateau,
      ),
    ).toBe(true);
  });
});

describe("actionToCommands", () => {
  it("emits only L/R for turns", () => {
    expect(actionToCommands(probe(), { type: "turn", command: "L" })).toBe("L");
    expect(actionToCommands(probe(), { type: "turn", command: "R" })).toBe("R");
  });

  it("emits turn + M sequences the API accepts", () => {
    expect(
      actionToCommands(probe({ direction: "NORTH" }), {
        type: "step",
        cardinal: "EAST",
      }),
    ).toBe("RM");
    expect(
      actionToCommands(probe({ direction: "NORTH" }), {
        type: "step",
        cardinal: "WEST",
      }),
    ).toBe("LM");
    expect(
      actionToCommands(probe({ direction: "NORTH" }), {
        type: "step",
        cardinal: "NORTH",
      }),
    ).toBe("M");
  });
});

describe("stepTarget", () => {
  it("moves one cell in the requested cardinal", () => {
    expect(stepTarget(probe({ x: 2, y: 2 }), "NORTH")).toEqual({ x: 2, y: 3 });
    expect(stepTarget(probe({ x: 2, y: 2 }), "EAST")).toEqual({ x: 3, y: 2 });
    expect(stepTarget(probe({ x: 2, y: 2 }), "SOUTH")).toEqual({ x: 2, y: 1 });
    expect(stepTarget(probe({ x: 2, y: 2 }), "WEST")).toEqual({ x: 1, y: 2 });
  });
});

describe("keyboard mapping", () => {
  it("maps WASD/arrows to cardinals and Q/E to turns", () => {
    expect(keyToCardinal("w")).toBe("NORTH");
    expect(keyToCardinal("ArrowRight")).toBe("EAST");
    expect(keyToTurn("q")).toBe("L");
    expect(keyToTurn("E")).toBe("R");
    expect(keyToCardinal("z")).toBeNull();
  });
});
