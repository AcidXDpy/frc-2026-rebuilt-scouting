import type { GameConfig } from "@/lib/types";

export const defaultGameConfig: GameConfig = {
  gameName: "REBUILT",
  season: 2026,
  scoringFields: {
    fuel: { label: "Fuel into Hub", maxPerPhase: 80 },
    climb: { levels: ["None", "Park", "Low Tower", "Mid Tower", "High Tower", "Traversal Tower"] },
    ratings: { defenseMax: 5, driverSkillMax: 5, reliabilityMax: 5 }
  },
  pointValues: {
    autoFuel: 4,
    teleopFuel: 2,
    climb: {
      None: 0,
      Park: 2,
      "Low Tower": 4,
      "Mid Tower": 8,
      "High Tower": 12,
      "Traversal Tower": 16
    },
    foulPenalty: 3
  },
  validations: {
    maxFuelAttemptsPerMatch: 140,
    maxCycleSeconds: 90,
    minCycleSeconds: 4
  },
  quickNotes: [
    "Clean intake",
    "Fast cycles",
    "Traffic issues",
    "Strong defense",
    "Weak under contact",
    "Auto reliable",
    "Climb risky",
    "Great driver"
  ],
  intakeSources: ["Ground", "Human Player", "Both", "Mostly preloaded"],
  archetypes: ["scorer", "defender", "climber", "hybrid", "support bot"]
};
