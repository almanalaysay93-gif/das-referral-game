// assets.ts — game asset paths using the high-quality assets in /game-assets/

export const ASSETS = {
  reference: "/game-assets/hospital-ward-patients-v2.png",
  doctorIdle: "/game-assets/doctor-walk-reference-v1/doctor-walk-01.png",
  doctorRun: "/game-assets/doctor-walk-reference-v1/doctor-walk-01.png",
  doctorWalkFrames: [
    "/game-assets/doctor-walk-reference-v1/doctor-walk-01.png",
    "/game-assets/doctor-walk-reference-v1/doctor-walk-02.png",
    "/game-assets/doctor-walk-reference-v1/doctor-walk-03.png",
    "/game-assets/doctor-walk-reference-v1/doctor-walk-04.png",
    "/game-assets/doctor-walk-reference-v1/doctor-walk-05.png",
    "/game-assets/doctor-walk-reference-v1/doctor-walk-06.png",
    "/game-assets/doctor-walk-reference-v1/doctor-walk-07.png",
  ],
  levelBackgrounds: [
    "/game-assets/hospital-ward-patients-v2.png",
    "/game-assets/hospital-level-2-gcs-v1.png",
    "/game-assets/hospital-level-3-ventilator-v1.png",
    "/game-assets/hospital-level-4-coordinator-v1.png",
    "/game-assets/hospital-level-5-night-v1.png",
  ],
  corridor: "/game-assets/hospital-ward-patients-v2.png",
  bedA: "/game-assets/patient-dark-game-v1.png",
  bedB: "/game-assets/patient-silver-game-v1.png",
  door: "/game-assets/hospital-ward-v1.png",
  floor: "/game-assets/hospital-ward-game-v1.png",
} as const;
