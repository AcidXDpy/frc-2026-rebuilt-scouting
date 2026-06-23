import type { ModelOutput, TeamAdvancedMetrics } from "@/lib/types";

const round = (value: number) => Number(value.toFixed(1));

export function reliabilityModel(team: TeamAdvancedMetrics): ModelOutput<number> {
  const prediction = Math.max(0, Math.min(100, team.consistency * 0.36 + (100 - team.breakdownRisk) * 0.34 + (100 - team.foulRisk) * 0.16 + team.confidence * 0.14));
  return {
    prediction: round(prediction),
    confidence: round(team.confidence),
    topPositiveFactors: [
      { label: "Consistency", value: team.consistency, weight: 0.36 },
      { label: "Low breakdown risk", value: 100 - team.breakdownRisk, weight: 0.34 }
    ],
    topNegativeFactors: [
      { label: "Foul risk", value: team.foulRisk, weight: -0.16 },
      { label: "Volatility", value: team.volatility, weight: -0.1 }
    ],
    explanation: "Reliability blends stable output, low failure flags, low foul rate, and scout confidence.",
    featureWeights: { consistency: 0.36, lowBreakdownRisk: 0.34, lowFoulRisk: 0.16, confidence: 0.14 }
  };
}
