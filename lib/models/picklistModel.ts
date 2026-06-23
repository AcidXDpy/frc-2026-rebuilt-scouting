import type { AllianceSynergy, ModelOutput, TeamAdvancedMetrics } from "@/lib/types";

const round = (value: number, places = 1) => Number(value.toFixed(places));

export const defaultPickWeights = {
  adjustedEpa: 0.3,
  reliability: 0.18,
  auto: 0.14,
  climb: 0.12,
  defense: 0.1,
  consistency: 0.08,
  synergy: 0.08,
  riskPenalty: -0.1
};

export function picklistValueModel(team: TeamAdvancedMetrics, synergyScore = 75, weights = defaultPickWeights): ModelOutput<number> {
  const value =
    weights.adjustedEpa * team.adjustedEpa +
    weights.reliability * (100 - team.breakdownRisk) +
    weights.auto * team.autoEpa +
    weights.climb * team.endgameEpa +
    weights.defense * team.defenseImpact +
    weights.consistency * team.consistency +
    weights.synergy * synergyScore +
    weights.riskPenalty * team.boomBustRisk;

  return {
    prediction: round(value, 2),
    confidence: team.confidence,
    topPositiveFactors: [
      { label: "Adjusted EPA", value: team.adjustedEpa, weight: weights.adjustedEpa },
      { label: "Reliability", value: 100 - team.breakdownRisk, weight: weights.reliability },
      { label: "Synergy fit", value: synergyScore, weight: weights.synergy }
    ],
    topNegativeFactors: [
      { label: "Risk penalty", value: team.boomBustRisk, weight: weights.riskPenalty },
      { label: "Foul risk", value: team.foulRisk, weight: -0.04 }
    ],
    explanation: `${team.teamNumber} pick value is risk-adjusted, so a lower OPR robot can rise if it is reliable, complementary, or defensive.`,
    featureWeights: weights
  };
}

export function allianceSynergyModel(teamNumbers: number[], metrics: TeamAdvancedMetrics[]): ModelOutput<AllianceSynergy> {
  const alliance = teamNumbers.map((team) => metrics.find((metric) => metric.teamNumber === team)).filter(Boolean) as TeamAdvancedMetrics[];
  const avg = (values: number[]) => values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
  const roleBalance = Math.min(100, new Set(alliance.map((team) => team.archetype)).size * 28 + 18);
  const autoCompatibility = Math.max(20, 100 - Math.max(0, avg(alliance.map((team) => team.autoEpa)) - 40) * 0.7);
  const trafficRisk = Math.min(100, avg(alliance.map((team) => team.avgCycles)) * 13);
  const climbCompatibility = Math.max(10, 100 - alliance.filter((team) => team.climbSuccessProbability > 70).length * 14);
  const defenseCoverage = Math.min(100, Math.max(...alliance.map((team) => team.defenseImpact), 0) + roleBalance * 0.22);
  const reliability = avg(alliance.map((team) => 100 - team.breakdownRisk));
  const score = Math.max(0, Math.min(100, roleBalance * 0.2 + autoCompatibility * 0.16 + (100 - trafficRisk) * 0.18 + climbCompatibility * 0.12 + defenseCoverage * 0.18 + reliability * 0.16));
  const warnings = [
    trafficRisk > 70 ? "High field traffic risk: assign separate lanes early." : "",
    climbCompatibility < 60 ? "Endgame crowding risk: stagger Tower arrival times." : "",
    defenseCoverage < 45 ? "Limited defensive answer if opponent has a carry scorer." : ""
  ].filter(Boolean);
  const recommendedRoles = Object.fromEntries(alliance.map((team) => [team.teamNumber, roleFor(team)]));

  return {
    prediction: {
      teams: teamNumbers,
      score: round(score),
      roleBalance: round(roleBalance),
      autoCompatibility: round(autoCompatibility),
      trafficRisk: round(trafficRisk),
      climbCompatibility: round(climbCompatibility),
      defenseCoverage: round(defenseCoverage),
      warnings,
      recommendedRoles,
      idealStrategy: "Let the highest EPA scorer run clean cycles, keep one robot flexible for traffic relief, and protect the best endgame robot's climb window.",
      backupStrategy: "If fuel cycles jam, pivot the lowest EPA robot into defense and bank endgame points."
    },
    confidence: round(avg(alliance.map((team) => team.confidence))),
    topPositiveFactors: [
      { label: "Role balance", value: round(roleBalance), weight: 0.2 },
      { label: "Defense coverage", value: round(defenseCoverage), weight: 0.18 }
    ],
    topNegativeFactors: [
      { label: "Traffic risk", value: round(trafficRisk), weight: -0.18 },
      { label: "Climb crowding", value: round(100 - climbCompatibility), weight: -0.12 }
    ],
    explanation: "Synergy is a fit score, not a sum of team strength. It rewards complementary jobs and punishes lane/endgame conflicts.",
    featureWeights: { roleBalance: 0.2, autoCompatibility: 0.16, trafficRisk: -0.18, climbCompatibility: 0.12, defenseCoverage: 0.18, reliability: 0.16 }
  };
}

function roleFor(team: TeamAdvancedMetrics) {
  if (team.defenseImpact > 74) return "Primary disruptor";
  if (team.adjustedEpa > 135) return "Protected carry scorer";
  if (team.autoEpa > 32) return "Auto opener";
  if (team.climbSuccessProbability > 80) return "Endgame anchor";
  return "Support cycles";
}
