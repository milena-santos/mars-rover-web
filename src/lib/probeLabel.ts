import type { Probe } from "@/lib/types";

export function probeIndex(probes: Probe[], id: string): number {
  return probes.findIndex((probe) => probe.id === id);
}

export function probeLabel(probes: Probe[], id: string): string {
  const index = probeIndex(probes, id);
  if (index < 0) return "Sonda";
  return `Sonda ${index + 1}`;
}

export function probeCaption(probe: Probe, index: number): string {
  return `Sonda ${index + 1} · (${probe.x},${probe.y})`;
}
