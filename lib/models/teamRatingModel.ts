import type { ModelOutput, TeamAdvancedMetrics } from "@/lib/types";

const round = (value: number, places = 1) => Number(value.toFixed(places));

export function bayesianTeamStrengthEstimate(team: TeamAdvancedMetrics, fieldAverage = 95): ModelOutput<number> {
  const priorWeight = Math.max(1, 8 - team.confidence / 18);
  const sampleWeight = Math.max(2, team.confidence / 18);
  const prediction = (fieldAverage * priorWeight + team.reliabilityAdjustedEpa * sampleWeight) / (priorWeight + sampleWeight);

  return {
    prediction: round(prediction),
    confidence: round(team.confidence),
    topPositiveFactors: [
      { label: "Reliability-adjusted EPA", value: team.reliabilityAdjustedEpa, weight: 0.38 },
      { label: "Imported OPR", value: team.opr, weight: 0.24 },
      { label: "Ceiling", value: team.ceiling, weight: 0.16 }
    ],
    topNegativeFactors: [
      { label: "Boom/bust risk", value: team.boomBustRisk, weight: -0.14 },
      { label: "Foul risk", value: team.foulRisk, weight: -0.08 }
    ],
    explanation: `${team.teamNumber} regresses toward the event mean when confidence is low, then shifts toward reliability-adjusted EPA as scouting confidence improves.`,
    featureWeights: { priorMean: priorWeight, reliabilityAdjustedEpa: sampleWeight, opr: 0.24, risk: -0.22 }
  };
}

export function eloStyleRating(team: TeamAdvancedMetrics): ModelOutput<number> {
  const prediction = 1500 + (team.reliabilityAdjustedEpa - 90) * 5.2 + team.consistency * 1.1 - team.foulRisk * 1.4;
  return {
    prediction: round(prediction),
    confidence: round(Math.min(96, team.confidence + team.consistency * 0.12)),
    topPositiveFactors: [
      { label: "Adjusted EPA", value: team.adjustedEpa, weight: 0.42 },
      { label: "Consistency", value: team.consistency, weight: 0.2 }
    ],
    topNegativeFactors: [
      { label: "Foul risk", value: team.foulRisk, weight: -0.14 },
      { label: "Volatility", value: team.volatility, weight: -0.1 }
    ],
    explanation: "Elo-style score is a scouting-friendly strength index, not official Elo. It rewards stable EPA and punishes avoidable match risk.",
    featureWeights: { reliabilityAdjustedEpa: 5.2, consistency: 1.1, foulRisk: -1.4, volatility: -0.1 }
  };
}
