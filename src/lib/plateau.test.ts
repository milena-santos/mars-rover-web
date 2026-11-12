import { describe, expect, it } from "vitest";

import { MAX_MESH_SIZE, parseMeshSize } from "@/lib/plateau";

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
