import type { ModelOutput, TeamAdvancedMetrics } from "@/lib/types";

const avg = (values: number[]) => values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
const round = (value: number) => Number(value.toFixed(1));

export function upsetRiskModel(favorite: TeamAdvancedMetrics[], underdog: TeamAdvancedMetrics[]): ModelOutput<number> {
  const favoriteCeiling = avg(favorite.map((team) => team.ceiling));
  const underdogCeiling = avg(underdog.map((team) => team.ceiling));
  const favoriteRisk = avg(favorite.map((team) => team.boomBustRisk + team.foulRisk));
  const underdogDefense = avg(underdog.map((team) => team.defenseImpact));
  const prediction = Math.max(2, Math.min(48, 18 + (underdogCeiling - favoriteCeiling) * 0.08 + favoriteRisk * 0.18 + underdogDefense * 0.08));

  return {
    prediction: round(prediction),
    confidence: round(avg([...favorite, ...underdog].map((team) => team.confidence))),
    topPositiveFactors: [
      { label: "Favorite risk", value: round(favoriteRisk), weight: 0.18 },
      { label: "Underdog defense", value: round(underdogDefense), weight: 0.08 }
    ],
    topNegativeFactors: [
      { label: "Favorite ceiling", value: round(favoriteCeiling), weight: -0.08 },
      { label: "Underdog ceiling gap", value: round(favoriteCeiling - underdogCeiling), weight: -0.08 }
    ],
    explanation: "Upset risk rises when the stronger alliance has foul/failure volatility and the lower alliance has enough defensive disruption to drag the match into variance.",
    featureWeights: { underdogCeiling: 0.08, favoriteCeiling: -0.08, favoriteRisk: 0.18, underdogDefense: 0.08 }
  };
}
