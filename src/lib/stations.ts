export type OrbitalStationDef = {
  id: string;
  label: string;
  code: string;
  color: string;
  size: number;
  orbitRadius: number;
  orbitSpeed: number;
  orbitTilt: number;
  phase: number;
};

export const ORBITAL_TILT = 0.12;

export const ORBITAL_STATIONS: OrbitalStationDef[] = [
  {
    id: "relay-a",
    label: "Relay Alpha",
    code: "ORB / A",
    color: "#e55838",
    size: 0.9,
    orbitRadius: 3.65,
    orbitSpeed: 0.035,
    orbitTilt: 0.08,
    phase: 0,
  },
  {
    id: "relay-b",
    label: "Relay Beta",
    code: "ORB / B",
    color: "#f0a050",
    size: 1.02,
    orbitRadius: 4.3,
    orbitSpeed: 0.024,
    orbitTilt: 0.18,
    phase: 1.4,
  },
  {
    id: "relay-c",
    label: "Survey Gate",
    code: "ORB / C",
    color: "#5e9fc7",
    size: 1.15,
    orbitRadius: 5,
    orbitSpeed: 0.017,
    orbitTilt: -0.12,
    phase: 2.8,
  },
  {
    id: "relay-d",
    label: "Cargo Ring",
    code: "ORB / D",
    color: "#d4b06a",
    size: 0.82,
    orbitRadius: 5.75,
    orbitSpeed: 0.014,
    orbitTilt: 0.32,
    phase: 4.1,
  },
  {
    id: "relay-e",
    label: "Art Node",
    code: "ORB / E",
    color: "#9b6bd1",
    size: 0.98,
    orbitRadius: 6.4,
    orbitSpeed: 0.01,
    orbitTilt: -0.22,
    phase: 5.5,
  },
];
