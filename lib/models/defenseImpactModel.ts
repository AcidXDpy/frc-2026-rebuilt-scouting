import type { ModelOutput, TeamAdvancedMetrics } from "@/lib/types";

const round = (value: number) => Number(value.toFixed(1));

export function defensiveMatchupModel(defender: TeamAdvancedMetrics, target: TeamAdvancedMetrics): ModelOutput<{ epaSuppression: number; assignment: string }> {
  const suppression = Math.max(0, defender.defenseImpact * 0.18 + defender.consistency * 0.05 - target.cycleEfficiency * 0.04 + target.boomBustRisk * 0.05);
  return {
    prediction: {
      epaSuppression: round(suppression),
      assignment: `Assign ${defender.teamNumber} to disrupt ${target.teamNumber} if ${target.teamNumber} is the opponent's clean-cycle engine.`
    },
    confidence: round((defender.confidence + target.confidence) / 2),
    topPositiveFactors: [
      { label: "Defender impact", value: defender.defenseImpact, weight: 0.18 },
      { label: "Target volatility", value: target.boomBustRisk, weight: 0.05 }
    ],
    topNegativeFactors: [
      { label: "Target cycle efficiency", value: target.cycleEfficiency, weight: -0.04 },
      { label: "Defender foul risk", value: defender.foulRisk, weight: -0.06 }
    ],
    explanation: `${target.teamNumber} is more vulnerable when they rely on fast repeated cycles and show volatility under pressure.`,
    featureWeights: { defenderDefense: 0.18, defenderConsistency: 0.05, targetCycleEfficiency: -0.04, targetRisk: 0.05 }
  };
}
