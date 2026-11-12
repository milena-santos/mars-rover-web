import { ApiError } from "@/lib/api";

export function collisionStatus(
  kind: "pouso" | "movimento",
  x: number,
  y: number,
  destroyedCount: number,
): string {
  const prefix = kind === "pouso" ? "Colisão no pouso" : "Colisão";
  return `${prefix} em (${x}, ${y}): ${destroyedCount} sondas destruídas.`;
}

export function humanizeApiError(err: unknown, fallback: string): string {
  if (!(err instanceof ApiError)) {
    return fallback;
  }

  const detail = err.message;
  if (
    detail.includes("outside the plateau") ||
    detail.includes("out of bounds") ||
    detail.includes("outside")
  ) {
    return "Fora da malha — movimento ignorado.";
  }
  if (detail.includes("must match the shared plateau")) {
    return "A malha precisa ser a mesma do planalto já criado nesta missão.";
  }
  if (
    detail.includes("Plateau dimensions must be between") ||
    detail.includes("greater than or equal to zero") ||
    detail.includes("Ensure this value is")
  ) {
    return "Malha inválida — use inteiros de 0 a 10.";
  }
  if (detail.includes("Invalid command")) {
    return "Comandos inválidos. Use apenas M, L e R.";
  }

  if (!detail || /api|endpoint|http|status|json/i.test(detail)) {
    return fallback;
  }

  return detail;
}
