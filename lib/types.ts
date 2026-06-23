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
  eventStats?: {
    rank?: number;
    rankingScore?: number;
    avgMatch?: number;
    avgAutoFuel?: number;
    avgTower?: number;
    record?: string;
    played?: number;
    rankingPoints?: number;
    opr?: number;
  };
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

export type TeamArchetype =
  | "Elite carry bot"
  | "High-volume scorer"
  | "Efficient sniper"
  | "Cycle merchant"
  | "Climb specialist"
  | "Defensive menace"
  | "Low-risk support bot"
  | "Volatile boom/bust bot"
  | "Practice bot / avoid"
  | "Data insufficient";

export type TeamAdvancedMetrics = {
  teamNumber: number;
  teamName: string;
  epa: number;
  autoEpa: number;
  teleopEpa: number;
  endgameEpa: number;
  adjustedEpa: number;
  reliabilityAdjustedEpa: number;
  opr: number;
  dpr: number;
  fuelAccuracy: number;
  avgCycles: number;
  cycleStdDev: number;
  climbSuccessRate: number;
  climbSuccessProbability: number;
  defenseImpact: number;
  foulRisk: number;
  breakdownRisk: number;
  consistency: number;
  ceiling: number;
  floor: number;
  volatility: number;
  confidence: number;
  archetype: TeamArchetype;
  archetypeExplanation: string;
  trend: number[];
  pickValue: number;
  scoutAgreement: number;
  scoutConfidenceScore: number;
  boomBustRisk: number;
  cycleEfficiency: number;
  fuelAccuracyTrend: number[];
};

export type ModelFactor = {
  label: string;
  value: number | string;
  weight?: number;
};

export type ModelOutput<TPrediction> = {
  prediction: TPrediction;
  confidence: number;
  topPositiveFactors: ModelFactor[];
  topNegativeFactors: ModelFactor[];
  explanation: string;
  featureWeights: Record<string, number>;
};

export type MatchPrediction = {
  redTeams: number[];
  blueTeams: number[];
  redWinProb: number;
  blueWinProb: number;
  predictedRedScore: number;
  predictedBlueScore: number;
  upsetRisk: number;
  decidingFactors: string[];
  recommendedStrategy: string;
  simulationSummary: {
    simulations: number;
    averageRedScore: number;
    averageBlueScore: number;
    redScoreDistribution: number[];
    blueScoreDistribution: number[];
    mostLikelyDecidingFactor: string;
  };
};

export type AllianceSynergy = {
  teams: number[];
  score: number;
  roleBalance: number;
  autoCompatibility: number;
  trafficRisk: number;
  climbCompatibility: number;
  defenseCoverage: number;
  warnings: string[];
  recommendedRoles: Record<number, string>;
  idealStrategy: string;
  backupStrategy: string;
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
