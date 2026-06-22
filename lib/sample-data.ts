import { defaultGameConfig } from "@/lib/game-config";
import type { Match, MatchScoutEntry, PitScoutEntry, Team } from "@/lib/types";

export const event = {
  id: "2026miket",
  key: "2026miket",
  name: "Motor City REBUILT District",
  location: "Detroit, MI",
  startsAt: "2026-03-06",
  endsAt: "2026-03-08",
  gameConfig: defaultGameConfig
};

export const teams: Team[] = [
  { number: 27, name: "RUSH", city: "Clarkston", state: "MI", strengths: ["high fuel volume", "reliable climb"], weaknesses: ["can draw defense"], strategyNotes: "Best as protected primary scorer." },
  { number: 67, name: "HOT Team", city: "Milford", state: "MI", strengths: ["auto fuel", "driver skill"], weaknesses: ["mid-match repair history"], strategyNotes: "Prioritize center auto lane." },
  { number: 118, name: "Robonauts", city: "League City", state: "TX", strengths: ["elite cycling", "clean hub shots"], weaknesses: ["needs space near hub"], strategyNotes: "Assign partner to screen defense." },
  { number: 148, name: "Robowranglers", city: "Greenville", state: "TX", strengths: ["defense resistant", "fast intake"], weaknesses: ["climb time varies"], strategyNotes: "Can flex between scorer and late defense." },
  { number: 254, name: "Cheesy Poofs", city: "San Jose", state: "CA", strengths: ["consistent auto", "high accuracy"], weaknesses: ["rare connection blips"], strategyNotes: "Anchor every high-value alliance." },
  { number: 1678, name: "Citrus Circuits", city: "Davis", state: "CA", strengths: ["data-backed cycles", "endgame timing"], weaknesses: ["limited defender reps"], strategyNotes: "Trust for solo cycle lane." },
  { number: 2056, name: "OP Robotics", city: "Stoney Creek", state: "ON", strengths: ["climb consistency", "low error rate"], weaknesses: ["moderate fuel ceiling"], strategyNotes: "Excellent second pick profile." },
  { number: 2767, name: "Stryke Force", city: "Kalamazoo", state: "MI", strengths: ["physical defense", "support play"], weaknesses: ["fuel streaky"], strategyNotes: "Use for shutdown role against volume scorers." }
];

export const matches: Match[] = [
  { id: "qm1", number: 1, time: "2026-03-06T09:10:00-05:00", red: [27, 67, 2767], blue: [118, 148, 2056], redScore: 114, blueScore: 121 },
  { id: "qm2", number: 2, time: "2026-03-06T09:22:00-05:00", red: [254, 1678, 2056], blue: [27, 118, 2767], redScore: 138, blueScore: 129 },
  { id: "qm3", number: 3, time: "2026-03-06T09:34:00-05:00", red: [148, 254, 67], blue: [1678, 27, 2056], redScore: 142, blueScore: 133 },
  { id: "qm4", number: 4, time: "2026-03-06T09:46:00-05:00", red: [118, 2767, 2056], blue: [254, 148, 67] }
];

const entry = (matchNumber: number, teamNumber: number, alliance: "red" | "blue", auto: [number, number], tele: [number, number], climb: string, defense: number, skill: number, cycles: number[], flags: Partial<MatchScoutEntry> = {}): MatchScoutEntry => ({
  id: `m${matchNumber}-${teamNumber}`,
  eventId: event.id,
  matchId: `qm${matchNumber}`,
  matchNumber,
  teamNumber,
  alliance,
  station: `${alliance.toUpperCase()} ${((matchNumber + teamNumber) % 3) + 1}`,
  scoutName: ["Avery", "Sam", "Jordan", "Riley"][teamNumber % 4],
  autoFuelMade: auto[0],
  autoFuelAttempted: auto[1],
  teleFuelMade: tele[0],
  teleFuelAttempted: tele[1],
  intakeSource: teamNumber % 2 ? "Ground" : "Both",
  cycleTimes: cycles,
  towerClimbLevel: climb,
  climbSuccess: climb !== "None" && climb !== "Park",
  defenseRating: defense,
  driverSkill: skill,
  penalties: 0,
  fouls: teamNumber === 2767 ? 1 : 0,
  disabled: false,
  tipped: false,
  connectionIssues: false,
  breakdowns: "",
  quickNotes: skill >= 5 ? ["Fast cycles", "Great driver"] : defense >= 4 ? ["Strong defense"] : ["Clean intake"],
  notes: "",
  createdAt: new Date().toISOString(),
  synced: true,
  ...flags
});

export const matchEntries: MatchScoutEntry[] = [
  entry(1, 27, "red", [5, 7], [22, 30], "High Tower", 2, 4, [18, 20, 21, 19]),
  entry(1, 67, "red", [7, 9], [18, 27], "Mid Tower", 2, 5, [22, 23, 25]),
  entry(1, 2767, "red", [1, 3], [7, 18], "Park", 5, 3, [34, 31]),
  entry(1, 118, "blue", [8, 10], [27, 34], "High Tower", 3, 5, [15, 16, 18, 17, 16]),
  entry(1, 148, "blue", [4, 6], [23, 31], "Mid Tower", 4, 4, [18, 19, 20, 18]),
  entry(1, 2056, "blue", [3, 5], [14, 22], "Traversal Tower", 2, 4, [25, 24, 26]),
  entry(2, 254, "red", [9, 10], [30, 35], "High Tower", 2, 5, [14, 15, 15, 16, 14]),
  entry(2, 1678, "red", [8, 9], [29, 36], "Traversal Tower", 2, 5, [15, 16, 15, 17, 16]),
  entry(2, 2056, "red", [3, 5], [16, 23], "Traversal Tower", 1, 4, [25, 23, 24]),
  entry(2, 27, "blue", [6, 8], [25, 32], "High Tower", 2, 4, [17, 19, 18, 20]),
  entry(2, 118, "blue", [8, 11], [28, 36], "High Tower", 2, 5, [15, 16, 17, 16, 18]),
  entry(2, 2767, "blue", [2, 4], [8, 17], "Park", 5, 3, [32, 35], { fouls: 2 }),
  entry(3, 148, "red", [5, 7], [24, 33], "High Tower", 4, 4, [17, 18, 19, 18]),
  entry(3, 254, "red", [10, 11], [31, 37], "High Tower", 2, 5, [14, 14, 15, 14, 15]),
  entry(3, 67, "red", [7, 8], [19, 26], "Mid Tower", 2, 5, [21, 22, 23]),
  entry(3, 1678, "blue", [9, 10], [28, 35], "Traversal Tower", 2, 5, [15, 15, 16, 16, 15]),
  entry(3, 27, "blue", [5, 8], [24, 31], "High Tower", 2, 4, [18, 19, 20, 19]),
  entry(3, 2056, "blue", [4, 5], [15, 22], "Traversal Tower", 1, 4, [24, 25, 24])
];

export const pitEntries: PitScoutEntry[] = teams.map((team, index) => ({
  id: `pit-${team.number}`,
  eventId: event.id,
  teamNumber: team.number,
  scoutName: ["Morgan", "Taylor", "Casey"][index % 3],
  drivetrain: index % 3 === 0 ? "Swerve" : index % 3 === 1 ? "West Coast" : "Tank",
  weightLbs: 110 + (index % 5) * 4,
  frameLengthIn: 28,
  frameWidthIn: 28 + (index % 2) * 2,
  mechanisms: index % 2 ? ["over-bumper intake", "adjustable shooter", "single-stage climb"] : ["wide intake", "fixed hub shooter", "double-stage climb"],
  climbAbility: defaultGameConfig.scoringFields.climb.levels[2 + (index % 4)],
  scoringLevels: ["Hub close", "Hub far", "Auto preload"],
  autoPaths: index % 2 ? ["taxi + 5 fuel", "center pickup"] : ["taxi + 3 fuel", "source side pickup"],
  driveTeamComments: "Calm drive coach, clear role preference, communicates field traffic well.",
  reliability: 3 + (index % 3),
  repairNotes: index === 4 ? "Inspect radio mount after each match." : "No major recurring repairs reported.",
  archetypes: index % 4 === 0 ? ["scorer", "climber"] : index % 4 === 1 ? ["hybrid"] : index % 4 === 2 ? ["defender", "support bot"] : ["scorer"],
  photos: [],
  createdAt: new Date().toISOString()
}));
