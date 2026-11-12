import type { Probe } from "@/lib/types";

export function probeLabel(probes: Probe[], id: string): string {
  const index = probes.findIndex((probe) => probe.id === id);
  if (index < 0) return "Sonda";
  return `Sonda ${index + 1}`;
}

export function probeCaption(probe: Probe, index: number): string {
  return `Sonda ${index + 1} · (${probe.x},${probe.y})`;
}
