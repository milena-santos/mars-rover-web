import type {
  ApiErrorBody,
  CollisionEvent,
  Direction,
  LaunchResult,
  MoveResult,
  Probe,
} from "@/lib/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");

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
    throw new ApiError(
      "NEXT_PUBLIC_API_URL is not configured. Set it in .env.",
      500,
    );
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

function isCollisionBody(body: ApiErrorBody): body is CollisionEvent {
  return (
    body.event === "collision" &&
    typeof body.x === "number" &&
    typeof body.y === "number" &&
    Array.isArray(body.destroyed)
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

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${requireApiUrl()}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const body = (await response.json().catch(() => ({}))) as T & ApiErrorBody;

  if (!response.ok) {
    throw new ApiError(formatDetail(body.detail), response.status);
  }

  return body;
}

export function listProbes(): Promise<{ probes: Probe[] }> {
  return request("/api/probes/");
}

export async function launchProbe(input: {
  x: number;
  y: number;
  direction: Direction;
}): Promise<LaunchResult> {
  const response = await fetch(`${requireApiUrl()}/api/probes/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  const body = (await response.json().catch(() => ({}))) as Probe &
    ApiErrorBody;

  if (!response.ok) {
    throw new ApiError(formatDetail(body.detail), response.status);
  }

  if (isCollisionBody(body)) {
    return { kind: "collision", collision: toCollision(body) };
  }

  return { kind: "launched", probe: body };
}

export async function moveProbe(
  probeId: string,
  commands: string,
): Promise<MoveResult> {
  const response = await fetch(
    `${requireApiUrl()}/api/probes/${probeId}/commands/`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ commands }),
    },
  );

  const body = (await response.json().catch(() => ({}))) as Probe &
    ApiErrorBody;

  if (!response.ok) {
    throw new ApiError(formatDetail(body.detail), response.status);
  }

  if (isCollisionBody(body)) {
    return { kind: "collision", collision: toCollision(body) };
  }

  return { kind: "moved", probe: body };
}

export function clearProbes(): Promise<void> {
  return request("/api/probes/", {
    method: "DELETE",
  });
}
