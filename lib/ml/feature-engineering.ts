import type { TeamAdvancedMetrics } from "@/lib/types";

export type TeamFeatureVector = {
  teamNumber: number;
  teamName: string;
  features: Record<string, number>;
  target: number;
};

export const mlFeatureKeys = [
  "opr",
  "autoEpa",
  "teleopEpa",
  "endgameEpa",
  "fuelAccuracy",
  "cycleEfficiency",
  "climbSuccessProbability",
  "defenseImpact",
  "consistency",
  "ceiling",
  "floor",
  "volatility",
  "foulRisk",
  "breakdownRisk",
  "confidence"
] as const;

export type MlFeatureKey = typeof mlFeatureKeys[number];

export function buildTeamFeatureVectors(metrics: TeamAdvancedMetrics[]): TeamFeatureVector[] {
  return metrics.map((team) => ({
    teamNumber: team.teamNumber,
    teamName: team.teamName,
    features: {
      opr: team.opr,
      autoEpa: team.autoEpa,
      teleopEpa: team.teleopEpa,
      endgameEpa: team.endgameEpa,
      fuelAccuracy: team.fuelAccuracy,
      cycleEfficiency: team.cycleEfficiency,
      climbSuccessProbability: team.climbSuccessProbability,
      defenseImpact: team.defenseImpact,
      consistency: team.consistency,
      ceiling: team.ceiling,
      floor: team.floor,
      volatility: team.volatility,
      foulRisk: team.foulRisk,
      breakdownRisk: team.breakdownRisk,
      confidence: team.confidence
    },
    target: team.reliabilityAdjustedEpa
  }));
}

export function zScoreNormalize(vectors: TeamFeatureVector[]) {
  const means = Object.fromEntries(mlFeatureKeys.map((key) => [key, average(vectors.map((vector) => vector.features[key]))])) as Record<MlFeatureKey, number>;
  const stds = Object.fromEntries(mlFeatureKeys.map((key) => [key, standardDeviation(vectors.map((vector) => vector.features[key])) || 1])) as Record<MlFeatureKey, number>;
  return {
    means,
    stds,
    vectors: vectors.map((vector) => ({
      ...vector,
      features: Object.fromEntries(mlFeatureKeys.map((key) => [key, (vector.features[key] - means[key]) / stds[key]]))
    }))
  };
}

export function featureDistance(a: TeamFeatureVector, b: TeamFeatureVector, keys: readonly MlFeatureKey[] = mlFeatureKeys) {
  return Math.sqrt(keys.reduce((sum, key) => sum + (a.features[key] - b.features[key]) ** 2, 0));
}

export function average(values: number[]) {
  return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
}

export function standardDeviation(values: number[]) {
  if (values.length < 2) return 0;
  const mean = average(values);
  return Math.sqrt(average(values.map((value) => (value - mean) ** 2)));
}

export function correlation(x: number[], y: number[]) {
  const xMean = average(x);
  const yMean = average(y);
  const numerator = x.reduce((sum, value, index) => sum + (value - xMean) * (y[index] - yMean), 0);
  const denominator = Math.sqrt(x.reduce((sum, value) => sum + (value - xMean) ** 2, 0) * y.reduce((sum, value) => sum + (value - yMean) ** 2, 0));
  return denominator ? numerator / denominator : 0;
}
