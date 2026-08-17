const BASE = (import.meta.env.BASE_URL || "/").replace(/\/$/, "");

export const ASSETS = {
  reference: `${BASE}/game-assets/hospital-ward-patients-v2.png`,
  doctorIdle: `${BASE}/game-assets/doctor-walk-reference-v1/doctor-walk-01.png`,
  doctorRun: `${BASE}/game-assets/doctor-walk-reference-v1/doctor-walk-01.png`,
  doctorWalkFrames: [
    `${BASE}/game-assets/doctor-walk-reference-v1/doctor-walk-01.png`,
    `${BASE}/game-assets/doctor-walk-reference-v1/doctor-walk-02.png`,
    `${BASE}/game-assets/doctor-walk-reference-v1/doctor-walk-03.png`,
    `${BASE}/game-assets/doctor-walk-reference-v1/doctor-walk-04.png`,
    `${BASE}/game-assets/doctor-walk-reference-v1/doctor-walk-05.png`,
    `${BASE}/game-assets/doctor-walk-reference-v1/doctor-walk-06.png`,
    `${BASE}/game-assets/doctor-walk-reference-v1/doctor-walk-07.png`,
  ],
  levelBackgrounds: [
    `${BASE}/game-assets/hospital-ward-patients-v2.png`,
    `${BASE}/game-assets/hospital-level-2-gcs-v1.png`,
    `${BASE}/game-assets/hospital-level-3-ventilator-v1.png`,
    `${BASE}/game-assets/hospital-level-4-coordinator-v1.png`,
    `${BASE}/game-assets/hospital-level-5-night-v1.png`,
  ],
  corridor: `${BASE}/game-assets/hospital-ward-patients-v2.png`,
  bedA: `${BASE}/game-assets/patient-dark-game-v1.png`,
  bedB: `${BASE}/game-assets/patient-silver-game-v1.png`,
  door: `${BASE}/game-assets/hospital-ward-v1.png`,
  floor: `${BASE}/game-assets/hospital-ward-game-v1.png`,
} as const;
