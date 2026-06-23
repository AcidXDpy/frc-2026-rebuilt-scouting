import type { MatchPrediction, ModelOutput, TeamAdvancedMetrics } from "@/lib/types";
import { allianceSynergyModel } from "@/lib/models/picklistModel";
import { upsetRiskModel } from "@/lib/models/upsetRiskModel";

const avg = (values: number[]) => values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
const round = (value: number, places = 1) => Number(value.toFixed(places));
const sigmoid = (value: number) => 1 / (1 + Math.exp(-value));

export function logisticWinProbability(red: TeamAdvancedMetrics[], blue: TeamAdvancedMetrics[]): ModelOutput<number> {
  const redValue = allianceValue(red);
  const blueValue = allianceValue(blue);
  const prediction = sigmoid((redValue - blueValue) / 32) * 100;
  return {
    prediction: round(prediction),
    confidence: round(avg([...red, ...blue].map((team) => team.confidence))),
    topPositiveFactors: [
      { label: "Red adjusted value", value: round(redValue), weight: 0.48 },
      { label: "Red reliability", value: round(avg(red.map((team) => 100 - team.breakdownRisk))), weight: 0.18 }
    ],
    topNegativeFactors: [
      { label: "Blue adjusted value", value: round(blueValue), weight: -0.48 },
      { label: "Red foul risk", value: round(avg(red.map((team) => team.foulRisk))), weight: -0.12 }
    ],
    explanation: "Logistic model converts alliance value differential into a win probability. It is stable, explainable, and ready to be replaced by trained weights later.",
    featureWeights: { valueDiff: 1 / 32, reliability: 0.18, foulRisk: -0.12 }
  };
}

export function monteCarloMatchSimulator(redTeams: number[], blueTeams: number[], metrics: TeamAdvancedMetrics[], simulations = 5000): ModelOutput<MatchPrediction> {
  const red = redTeams.map((team) => metrics.find((metric) => metric.teamNumber === team)).filter(Boolean) as TeamAdvancedMetrics[];
  const blue = blueTeams.map((team) => metrics.find((metric) => metric.teamNumber === team)).filter(Boolean) as TeamAdvancedMetrics[];
  const redSynergy = allianceSynergyModel(redTeams, metrics).prediction;
  const blueSynergy = allianceSynergyModel(blueTeams, metrics).prediction;
  const redScores: number[] = [];
  const blueScores: number[] = [];
  let redWins = 0;

  for (let i = 0; i < simulations; i++) {
    const redScore = simulateAlliance(red, redSynergy.score, i);
    const blueScore = simulateAlliance(blue, blueSynergy.score, i + 17);
    redScores.push(redScore);
    blueScores.push(blueScore);
    if (redScore > blueScore) redWins += 1;
  }

  const redWinProb = redWins / simulations * 100;
  const upset = redWinProb > 50 ? upsetRiskModel(red, blue).prediction : upsetRiskModel(blue, red).prediction;
  const decidingFactor = decidingFactorFor(red, blue);
  const redAvg = avg(redScores);
  const blueAvg = avg(blueScores);

  return {
    prediction: {
      redTeams,
      blueTeams,
      redWinProb: round(redWinProb),
      blueWinProb: round(100 - redWinProb),
      predictedRedScore: round(redAvg),
      predictedBlueScore: round(blueAvg),
      upsetRisk: round(upset),
      decidingFactors: [decidingFactor, redSynergy.warnings[0] ?? "Role execution", blueSynergy.warnings[0] ?? "Clean cycles"].filter(Boolean),
      recommendedStrategy: redWinProb >= 50 ? `Red path: protect ${bestScorer(red).teamNumber} and use ${bestDefender(red).teamNumber} as the pressure valve.` : `Red upset path: slow ${bestScorer(blue).teamNumber} and force a Tower timing mistake.`,
      simulationSummary: {
        simulations,
        averageRedScore: round(redAvg),
        averageBlueScore: round(blueAvg),
        redScoreDistribution: bucket(redScores),
        blueScoreDistribution: bucket(blueScores),
        mostLikelyDecidingFactor: decidingFactor
      }
    },
    confidence: round(avg([...red, ...blue].map((team) => team.confidence))),
    topPositiveFactors: [
      { label: "Red synergy", value: redSynergy.score, weight: 0.16 },
      { label: "Red ceiling", value: round(avg(red.map((team) => team.ceiling))), weight: 0.14 }
    ],
    topNegativeFactors: [
      { label: "Blue synergy", value: blueSynergy.score, weight: -0.16 },
      { label: "Red risk", value: round(avg(red.map((team) => team.boomBustRisk))), weight: -0.12 }
    ],
    explanation: "Monte Carlo samples EPA, variance, reliability failures, foul risk, climb probability, and synergy 5,000 times to estimate match shape.",
    featureWeights: { epa: 0.48, synergy: 0.16, reliability: 0.14, variance: -0.12, foulRisk: -0.1 }
  };
}

function allianceValue(teams: TeamAdvancedMetrics[]) {
  return teams.reduce((sum, team) => sum + team.reliabilityAdjustedEpa, 0) + avg(teams.map((team) => team.defenseImpact)) * 0.35;
}

function simulateAlliance(teams: TeamAdvancedMetrics[], synergy: number, seed: number) {
  return teams.reduce((sum, team, index) => {
    const wave = Math.sin((seed + 1) * (index + 3) * 12.9898) * 43758.5453;
    const random = wave - Math.floor(wave);
    const variance = (random - 0.5) * team.volatility * 2.1;
    const failure = random < team.breakdownRisk / 220 ? team.reliabilityAdjustedEpa * 0.32 : 0;
    const foul = random < team.foulRisk / 260 ? 6 : 0;
    return sum + team.reliabilityAdjustedEpa + variance - failure - foul;
  }, 0) * (0.86 + synergy / 520);
}

function bucket(values: number[]) {
  const sorted = [...values].sort((a, b) => a - b);
  return [0.1, 0.25, 0.5, 0.75, 0.9].map((quantile) => round(sorted[Math.floor((sorted.length - 1) * quantile)]));
}

function bestScorer(teams: TeamAdvancedMetrics[]) {
  return [...teams].sort((a, b) => b.adjustedEpa - a.adjustedEpa)[0];
}

function bestDefender(teams: TeamAdvancedMetrics[]) {
  return [...teams].sort((a, b) => b.defenseImpact - a.defenseImpact)[0];
}

function decidingFactorFor(red: TeamAdvancedMetrics[], blue: TeamAdvancedMetrics[]) {
  const autoGap = avg(red.map((team) => team.autoEpa)) - avg(blue.map((team) => team.autoEpa));
  const endgameGap = avg(red.map((team) => team.endgameEpa)) - avg(blue.map((team) => team.endgameEpa));
  const riskGap = avg(red.map((team) => team.boomBustRisk)) - avg(blue.map((team) => team.boomBustRisk));
  if (Math.abs(autoGap) > 8) return "Auto fuel advantage";
  if (Math.abs(endgameGap) > 5) return "Tower endgame execution";
  if (Math.abs(riskGap) > 10) return "Failure/foul volatility";
  return "Teleop cycle efficiency";
}
