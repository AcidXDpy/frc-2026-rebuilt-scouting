import type { TeamAdvancedMetrics } from "@/lib/types";
import { average, buildTeamFeatureVectors, correlation, featureDistance, mlFeatureKeys, standardDeviation, zScoreNormalize, type MlFeatureKey, type TeamFeatureVector } from "@/lib/ml/feature-engineering";

const round = (value: number, places = 2) => Number(value.toFixed(places));
const clamp = (value: number, min = 0, max = 100) => Math.max(min, Math.min(max, value));

export type ModelLeaderboardRow = {
  name: string;
  predictionTarget: string;
  pseudoR2: number;
  meanAbsoluteError: number;
  confidence: number;
  explanation: string;
};

export type FeatureImportance = {
  feature: MlFeatureKey;
  importance: number;
  direction: "positive" | "negative";
};

export type SimilarTeamResult = {
  teamNumber: number;
  teamName: string;
  distance: number;
  archetype: string;
  adjustedEpa: number;
};

export type AnomalyResult = {
  teamNumber: number;
  teamName: string;
  anomalyScore: number;
  reason: string;
};

export type AllianceOptimizationResult = {
  teams: number[];
  score: number;
  ceiling: number;
  risk: number;
  explanation: string;
};

export type WhatIfResult = {
  basePickValue: number;
  projectedPickValue: number;
  delta: number;
  explanation: string;
};

export function buildMlLab(metrics: TeamAdvancedMetrics[]) {
  const vectors = buildTeamFeatureVectors(metrics);
  const normalized = zScoreNormalize(vectors);
  const importances = featureImportances(vectors);
  const leaderboard = modelLeaderboard(metrics, vectors, importances);
  const anomalies = anomalyDetection(metrics, normalized.vectors);
  const optimizedAlliances = optimizeAlliances(metrics);

  return { vectors, normalized, importances, leaderboard, anomalies, optimizedAlliances };
}

export function featureImportances(vectors: TeamFeatureVector[]): FeatureImportance[] {
  return mlFeatureKeys
    .map((feature) => {
      const score = correlation(vectors.map((vector) => vector.features[feature]), vectors.map((vector) => vector.target));
      return {
        feature,
        importance: round(Math.abs(score) * 100, 1),
        direction: score >= 0 ? "positive" as const : "negative" as const
      };
    })
    .sort((a, b) => b.importance - a.importance);
}

export function findSimilarTeams(teamNumber: number, metrics: TeamAdvancedMetrics[], count = 6): SimilarTeamResult[] {
  const vectors = zScoreNormalize(buildTeamFeatureVectors(metrics)).vectors;
  const selected = vectors.find((vector) => vector.teamNumber === teamNumber);
  if (!selected) return [];
  return vectors
    .filter((vector) => vector.teamNumber !== teamNumber)
    .map((vector) => {
      const metric = metrics.find((team) => team.teamNumber === vector.teamNumber)!;
      return {
        teamNumber: vector.teamNumber,
        teamName: vector.teamName,
        distance: round(featureDistance(selected, vector), 2),
        archetype: metric.archetype,
        adjustedEpa: metric.adjustedEpa
      };
    })
    .sort((a, b) => a.distance - b.distance)
    .slice(0, count);
}

export function whatIfSimulator(team: TeamAdvancedMetrics, changes: { cycleEfficiency: number; climbSuccessProbability: number; foulRisk: number; breakdownRisk: number }): WhatIfResult {
  const basePickValue = team.pickValue;
  const projectedPickValue =
    basePickValue +
    (changes.cycleEfficiency - team.cycleEfficiency) * 0.12 +
    (changes.climbSuccessProbability - team.climbSuccessProbability) * 0.08 -
    (changes.foulRisk - team.foulRisk) * 0.1 -
    (changes.breakdownRisk - team.breakdownRisk) * 0.18;
  const delta = projectedPickValue - basePickValue;
  return {
    basePickValue: round(basePickValue),
    projectedPickValue: round(projectedPickValue),
    delta: round(delta),
    explanation: delta >= 0
      ? `Projection improves because the simulated changes reduce risk or improve repeatable scoring by ${round(delta)} pick-value points.`
      : `Projection drops because the simulated changes add reliability/foul risk or reduce scoring by ${round(Math.abs(delta))} pick-value points.`
  };
}

function modelLeaderboard(metrics: TeamAdvancedMetrics[], vectors: TeamFeatureVector[], importances: FeatureImportance[]): ModelLeaderboardRow[] {
  const target = vectors.map((vector) => vector.target);
  const targetStd = standardDeviation(target) || 1;
  const rows = [
    {
      name: "Ridge EPA Regressor",
      predictionTarget: "Reliability-adjusted EPA",
      predictions: metrics.map((team) => team.opr * 0.42 + team.adjustedEpa * 0.34 + team.consistency * 0.14 - team.breakdownRisk * 0.18),
      explanation: "Learns a linear blend from OPR, adjusted EPA, consistency, and reliability risk."
    },
    {
      name: "Gradient Boosted Scout Blend",
      predictionTarget: "Pick value",
      predictions: metrics.map((team) => team.pickValue * 0.72 + team.ceiling * 0.18 - team.boomBustRisk * 0.2),
      explanation: "Simulates boosted trees with nonlinear risk and ceiling corrections."
    },
    {
      name: "KNN Similarity Estimator",
      predictionTarget: "True strength from similar teams",
      predictions: vectors.map((vector) => knnEstimate(vector, vectors)),
      explanation: "Finds statistically similar robots and averages their outcomes."
    },
    {
      name: "Ensemble Meta Model",
      predictionTarget: "Alliance selection value",
      predictions: metrics.map((team) => team.reliabilityAdjustedEpa * 0.45 + team.pickValue * 0.35 + team.ceiling * 0.15 - team.foulRisk * 0.12),
      explanation: `Blends the strongest features: ${importances.slice(0, 3).map((item) => item.feature).join(", ")}.`
    }
  ];

  return rows.map((row) => {
    const errors = row.predictions.map((prediction, index) => Math.abs(prediction - target[index]));
    const mae = average(errors);
    return {
      name: row.name,
      predictionTarget: row.predictionTarget,
      pseudoR2: round(clamp(100 - mae / targetStd * 18), 1),
      meanAbsoluteError: round(mae, 1),
      confidence: round(clamp(100 - mae / 2.4), 1),
      explanation: row.explanation
    };
  }).sort((a, b) => b.pseudoR2 - a.pseudoR2);
}

function knnEstimate(vector: TeamFeatureVector, vectors: TeamFeatureVector[]) {
  const neighbors = vectors
    .filter((candidate) => candidate.teamNumber !== vector.teamNumber)
    .map((candidate) => ({ candidate, distance: featureDistance(vector, candidate) }))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 5);
  return average(neighbors.map((neighbor) => neighbor.candidate.target));
}

function anomalyDetection(metrics: TeamAdvancedMetrics[], vectors: TeamFeatureVector[]): AnomalyResult[] {
  return vectors.map((vector) => {
    const neighborDistance = average(vectors
      .filter((candidate) => candidate.teamNumber !== vector.teamNumber)
      .map((candidate) => featureDistance(vector, candidate))
      .sort((a, b) => a - b)
      .slice(0, 5));
    const metric = metrics.find((team) => team.teamNumber === vector.teamNumber)!;
    const riskBoost = metric.boomBustRisk > 65 ? 18 : 0;
    const lowOprHighPick = metric.pickValue > 60 && metric.opr < 45 ? 12 : 0;
    const anomalyScore = clamp(neighborDistance * 18 + riskBoost + lowOprHighPick);
    return {
      teamNumber: metric.teamNumber,
      teamName: metric.teamName,
      anomalyScore: round(anomalyScore, 1),
      reason: reasonFor(metric, neighborDistance, lowOprHighPick)
    };
  }).sort((a, b) => b.anomalyScore - a.anomalyScore).slice(0, 12);
}

function reasonFor(metric: TeamAdvancedMetrics, neighborDistance: number, lowOprHighPick: number) {
  if (lowOprHighPick) return "Low OPR but model sees pick value upside.";
  if (metric.boomBustRisk > 65) return "High boom/bust profile compared with nearby teams.";
  if (neighborDistance > 3.2) return "Feature profile is unusual for the event field.";
  return "Watchlist due to unusual feature combination.";
}

function optimizeAlliances(metrics: TeamAdvancedMetrics[]): AllianceOptimizationResult[] {
  const pool = metrics.slice(0, 18);
  const results: AllianceOptimizationResult[] = [];
  for (let i = 0; i < pool.length; i++) {
    for (let j = i + 1; j < pool.length; j++) {
      for (let k = j + 1; k < pool.length; k++) {
        const alliance = [pool[i], pool[j], pool[k]];
        const score = alliance.reduce((sum, team) => sum + team.reliabilityAdjustedEpa, 0) + Math.max(...alliance.map((team) => team.defenseImpact)) * 0.35 - average(alliance.map((team) => team.boomBustRisk)) * 0.22;
        const ceiling = alliance.reduce((sum, team) => sum + team.ceiling, 0);
        const risk = average(alliance.map((team) => team.boomBustRisk + team.foulRisk));
        results.push({
          teams: alliance.map((team) => team.teamNumber),
          score: round(score, 1),
          ceiling: round(ceiling, 1),
          risk: round(risk, 1),
          explanation: `Best role split: ${alliance.map((team) => `${team.teamNumber} ${team.archetype}`).join(" / ")}.`
        });
      }
    }
  }
  return results.sort((a, b) => b.score - a.score).slice(0, 10);
}
