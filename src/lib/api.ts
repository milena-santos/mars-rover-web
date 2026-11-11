import type { ApiErrorBody, Direction, Probe } from "@/lib/types";

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
      "NEXT_PUBLIC_API_URL is not configured. Set it in .env.local.",
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

export function launchProbe(input: {
  x: number;
  y: number;
  direction: Direction;
}): Promise<Probe> {
  return request("/api/probes/", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function moveProbe(probeId: string, commands: string): Promise<Probe> {
  return request(`/api/probes/${probeId}/commands/`, {
    method: "POST",
    body: JSON.stringify({ commands }),
  });
}
