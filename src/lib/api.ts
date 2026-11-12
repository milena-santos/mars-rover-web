import type {
  ApiErrorBody,
  CollisionEvent,
  Direction,
  LaunchResult,
  MoveResult,
  Probe,
} from "@/lib/types";

const API_URL = import.meta.env.VITE_API_URL?.replace(/\/$/, "");

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

function requireApiUrl(): string {
  if (!API_URL) {
    throw new ApiError("VITE_API_URL is not configured. Set it in .env.", 500);
  }
  return API_URL;
}

function formatDetail(detail: ApiErrorBody["detail"]): string {
  if (typeof detail === "string") {
    return detail;
  }
  if (detail && typeof detail === "object") {
    return JSON.stringify(detail);
  }
  return "Request failed.";
}

function isCollisionBody(body: unknown): body is CollisionEvent {
  if (!body || typeof body !== "object") return false;
  const value = body as CollisionEvent;
  return (
    value.event === "collision" &&
    typeof value.x === "number" &&
    typeof value.y === "number" &&
    Array.isArray(value.destroyed)
  );
}

function toCollision(body: CollisionEvent): CollisionEvent {
  return {
    event: "collision",
    detail: typeof body.detail === "string" ? body.detail : "Collision",
    x: body.x,
    y: body.y,
    destroyed: body.destroyed,
  };
}

async function requestJson(
  path: string,
  init?: RequestInit,
): Promise<{ ok: true; status: number; body: unknown } | never> {
  const response = await fetch(`${requireApiUrl()}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  if (response.status === 204) {
    return { ok: true, status: 204, body: undefined };
  }

  const body = (await response.json().catch(() => ({}))) as ApiErrorBody;
  if (!response.ok) {
    throw new ApiError(formatDetail(body.detail), response.status);
  }
  return { ok: true, status: response.status, body };
}

export function listProbes(): Promise<{ probes: Probe[] }> {
  return requestJson("/api/probes/").then(
    ({ body }) => body as { probes: Probe[] },
  );
}

export async function launchProbe(input: {
  x: number;
  y: number;
  direction: Direction;
}): Promise<LaunchResult> {
  const { body } = await requestJson("/api/probes/", {
    method: "POST",
    body: JSON.stringify(input),
  });

  if (isCollisionBody(body)) {
    return { kind: "collision", collision: toCollision(body) };
  }

  return { kind: "launched", probe: body as Probe };
}

export async function moveProbe(
  probeId: string,
  commands: string,
): Promise<MoveResult> {
  const { body } = await requestJson(`/api/probes/${probeId}/commands/`, {
    method: "POST",
    body: JSON.stringify({ commands }),
  });

  if (isCollisionBody(body)) {
    return { kind: "collision", collision: toCollision(body) };
  }

  return { kind: "moved", probe: body as Probe };
}

export function clearProbes(): Promise<void> {
  return requestJson("/api/probes/", { method: "DELETE" }).then(
    () => undefined,
  );
}
