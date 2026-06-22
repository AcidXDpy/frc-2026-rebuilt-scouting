export type Role = "admin" | "strategyLead" | "scout" | "viewer";
export type AllianceColor = "red" | "blue";

export type GameConfig = {
  gameName: string;
  season: number;
  scoringFields: {
    fuel: { label: string; maxPerPhase: number };
    climb: { levels: string[] };
    ratings: { defenseMax: number; driverSkillMax: number; reliabilityMax: number };
  };
  pointValues: {
    autoFuel: number;
    teleopFuel: number;
    climb: Record<string, number>;
    foulPenalty: number;
  };
  validations: {
    maxFuelAttemptsPerMatch: number;
    maxCycleSeconds: number;
    minCycleSeconds: number;
  };
  quickNotes: string[];
  intakeSources: string[];
  archetypes: string[];
};

export type Team = {
  number: number;
  name: string;
  city: string;
  state: string;
  strengths: string[];
  weaknesses: string[];
  strategyNotes: string;
};

export type Match = {
  id: string;
  number: number;
  time: string;
  red: number[];
  blue: number[];
  redScore?: number;
  blueScore?: number;
};

export type MatchScoutEntry = {
  id: string;
  eventId: string;
  matchId: string;
  matchNumber: number;
  teamNumber: number;
  alliance: AllianceColor;
  station: string;
  scoutName: string;
  autoFuelMade: number;
  autoFuelAttempted: number;
  teleFuelMade: number;
  teleFuelAttempted: number;
  intakeSource: string;
  cycleTimes: number[];
  towerClimbLevel: string;
  climbSuccess: boolean;
  defenseRating: number;
  driverSkill: number;
  penalties: number;
  fouls: number;
  disabled: boolean;
  tipped: boolean;
  connectionIssues: boolean;
  breakdowns: string;
  quickNotes: string[];
  notes: string;
  createdAt: string;
  synced: boolean;
};

export type PitScoutEntry = {
  id: string;
  eventId: string;
  teamNumber: number;
  scoutName: string;
  drivetrain: string;
  weightLbs: number;
  frameLengthIn: number;
  frameWidthIn: number;
  mechanisms: string[];
  climbAbility: string;
  scoringLevels: string[];
  autoPaths: string[];
  driveTeamComments: string;
  reliability: number;
  repairNotes: string;
  archetypes: string[];
  photos: string[];
  createdAt: string;
};

export type TeamMetric = {
  teamNumber: number;
  teamName: string;
  matchesPlayed: number;
  autoScore: number;
  teleopScore: number;
  endgameScore: number;
  fuelAccuracy: number;
  averageCycles: number;
  climbSuccessRate: number;
  defensiveImpact: number;
  consistency: number;
  reliability: number;
  epaLikeRating: number;
  eloRating: number;
  oprEstimate: number;
  confidence: number;
  confidenceInterval: [number, number];
  disabledRate: number;
};

export type PickWeights = {
  scoringWeight: number;
  climbWeight: number;
  reliabilityWeight: number;
  defenseWeight: number;
  consistencyWeight: number;
  autoWeight: number;
};

export type StrategyPrediction = {
  allianceScore: number;
  opponentScore: number;
  winProbability: number;
  scoreBreakdown: {
    auto: number;
    teleop: number;
    endgame: number;
    penalties: number;
  };
  synergy: number;
  warnings: string[];
};
