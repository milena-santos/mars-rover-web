import { describe, expect, it } from "vitest";

import { ApiError } from "@/lib/api";
import { collisionStatus, humanizeApiError } from "@/lib/errors";

describe("collisionStatus", () => {
  it("formats landing and movement collisions", () => {
    expect(collisionStatus("pouso", 0, 0, 2)).toBe(
      "Colisão no pouso em (0, 0): 2 sondas destruídas.",
    );
    expect(collisionStatus("movimento", 1, 2, 1)).toBe(
      "Colisão em (1, 2): 1 sondas destruídas.",
    );
  });
});

describe("humanizeApiError", () => {
  it("returns the fallback for non-API errors", () => {
    expect(humanizeApiError(new Error("boom"), "Falha.")).toBe("Falha.");
  });

  it("maps out-of-bounds messages from the API", () => {
    expect(
      humanizeApiError(
        new ApiError(
          "Command sequence would move the probe outside the plateau.",
          400,
        ),
        "Falha.",
      ),
    ).toBe("Fora da malha — movimento ignorado.");
  });

  it("maps shared plateau mismatch", () => {
    expect(
      humanizeApiError(
        new ApiError(
          "Launch dimensions must match the shared plateau (5x5).",
          400,
        ),
        "Falha.",
      ),
    ).toBe("A malha precisa ser a mesma do planalto já criado nesta missão.");
  });

  it("maps invalid plateau dimensions", () => {
    expect(
      humanizeApiError(
        new ApiError("Plateau dimensions must be between 0 and 10.", 400),
        "Falha.",
      ),
    ).toBe("Malha inválida — use inteiros de 0 a 10.");
    expect(
      humanizeApiError(
        new ApiError("Ensure this value is less than or equal to 10.", 400),
        "Falha.",
      ),
    ).toBe("Malha inválida — use inteiros de 0 a 10.");
  });

  it("maps invalid command sequences", () => {
    expect(
      humanizeApiError(new ApiError("Invalid command 'X'.", 400), "Falha."),
    ).toBe("Comandos inválidos. Use apenas M, L e R.");
  });
});
