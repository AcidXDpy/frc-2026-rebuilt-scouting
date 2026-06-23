import type { GameConfig, MatchScoutEntry, Team, TeamAdvancedMetrics, TeamArchetype } from "@/lib/types";
import { scoreEntry, standardDeviation } from "@/lib/stats";

const avg = (values: number[]) => values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
const clamp = (value: number, min = 0, max = 100) => Math.max(min, Math.min(max, value));
const round = (value: number, places = 1) => Number(value.toFixed(places));

export function calculateAdvancedTeamMetrics(teams: Team[], entries: MatchScoutEntry[], config: GameConfig): TeamAdvancedMetrics[] {
  return teams.map((team) => {
    const teamEntries = entries.filter((entry) => entry.teamNumber === team.number);
    const scores = teamEntries.map((entry) => scoreEntry(entry, config));
    const totals = scores.map((score) => score.total);
    const autoValues = scores.map((score) => score.auto);
    const teleopValues = scores.map((score) => score.teleop);
    const endgameValues = scores.map((score) => score.endgame);
    const allCycles = teamEntries.flatMap((entry) => entry.cycleTimes);
    const attemptsByMatch = teamEntries.map((entry) => entry.autoFuelAttempted + entry.teleFuelAttempted);
    const makesByMatch = teamEntries.map((entry) => entry.autoFuelMade + entry.teleFuelMade);
    const totalAttempts = attemptsByMatch.reduce((sum, value) => sum + value, 0);
    const totalMakes = makesByMatch.reduce((sum, value) => sum + value, 0);
    const disabledRate = avg(teamEntries.map((entry) => entry.disabled || entry.tipped || entry.connectionIssues ? 1 : 0));
    const breakdownRate = avg(teamEntries.map((entry) => entry.breakdowns ? 1 : 0));
    const foulRisk = clamp(avg(teamEntries.map((entry) => entry.fouls + entry.penalties)) * 18, 0, 100);
    const reliabilityScore = clamp(100 - disabledRate * 55 - breakdownRate * 35 - foulRisk * 0.18);
    const volatility = round(standardDeviation(totals));
    const consistency = clamp(100 - volatility / Math.max(avg(totals), 1) * 100);
    const confidence = clamp(35 + teamEntries.length * 12 + scoutAgreement(teamEntries) * 0.25, 20, 100);
    const autoEpa = avg(autoValues);
    const teleopEpa = avg(teleopValues);
    const endgameEpa = avg(endgameValues);
    const defenseImpact = avg(teamEntries.map((entry) => entry.defenseRating)) * 20;
    const importedOpr = team.eventStats?.opr ?? avg(totals);
    const baseEpa = importedOpr * 0.52 + (autoEpa + teleopEpa + endgameEpa) * 0.48;
    const failurePenalty = (100 - reliabilityScore) * 0.22;
    const foulPenalty = foulRisk * 0.12;
    const adjustedEpa = baseEpa + autoEpa * 0.18 + teleopEpa * 0.1 + endgameEpa * 0.12 + defenseImpact * 0.12 - foulPenalty - failurePenalty;
    const confidenceMultiplier = 0.72 + confidence / 360;
    const reliabilityAdjustedEpa = adjustedEpa * (reliabilityScore / 100) * confidenceMultiplier;
    const ceiling = avg(totals) + volatility * 1.15 + importedOpr * 0.18;
    const floor = Math.max(0, avg(totals) - volatility * 1.1 - failurePenalty);
    const climbSuccessRate = avg(teamEntries.map((entry) => entry.climbSuccess ? 1 : 0)) * 100;
    const cycleEfficiency = allCycles.length ? clamp(100 - (avg(allCycles) - 12) * 3.2) : 35;
    const fuelAccuracyTrend = teamEntries.map((entry) => {
      const attempts = entry.autoFuelAttempted + entry.teleFuelAttempted;
      return attempts ? round((entry.autoFuelMade + entry.teleFuelMade) / attempts * 100) : 0;
    });
    const boomBustRisk = clamp(volatility * 2.6 + (100 - reliabilityScore) * 0.5 + foulRisk * 0.45);
    const archetype = assignArchetype({
      adjustedEpa,
      reliabilityAdjustedEpa,
      fuelAccuracy: totalAttempts ? totalMakes / totalAttempts * 100 : 0,
      avgCycles: avg(teamEntries.map((entry) => entry.cycleTimes.length)),
      climbSuccessRate,
      defenseImpact,
      reliabilityScore,
      volatility,
      confidence
    });

    return {
      teamNumber: team.number,
      teamName: team.name,
      epa: round(baseEpa),
      autoEpa: round(autoEpa),
      teleopEpa: round(teleopEpa),
      endgameEpa: round(endgameEpa),
      adjustedEpa: round(adjustedEpa),
      reliabilityAdjustedEpa: round(reliabilityAdjustedEpa),
      opr: round(importedOpr, 2),
      dpr: round(100 - defenseImpact + foulRisk * 0.25),
      fuelAccuracy: round(totalAttempts ? totalMakes / totalAttempts * 100 : 0),
      avgCycles: round(avg(teamEntries.map((entry) => entry.cycleTimes.length))),
      cycleStdDev: round(standardDeviation(allCycles)),
      climbSuccessRate: round(climbSuccessRate),
      climbSuccessProbability: round(clamp(climbSuccessRate * 0.82 + confidence * 0.18)),
      defenseImpact: round(defenseImpact),
      foulRisk: round(foulRisk),
      breakdownRisk: round(clamp(disabledRate * 65 + breakdownRate * 35)),
      consistency: round(consistency),
      ceiling: round(ceiling),
      floor: round(floor),
      volatility,
      confidence: round(confidence),
      archetype,
      archetypeExplanation: explainArchetype(archetype),
      trend: totals.map((value, index) => round(value + importedOpr * 0.08 + index * (team.eventStats?.rankingScore ?? 1))),
      pickValue: round(adjustedEpa * 0.3 + reliabilityScore * 0.18 + autoEpa * 0.14 + endgameEpa * 0.12 + defenseImpact * 0.1 + consistency * 0.08 + confidence * 0.08 - boomBustRisk * 0.1),
      scoutAgreement: round(scoutAgreement(teamEntries)),
      scoutConfidenceScore: round(confidence),
      boomBustRisk: round(boomBustRisk),
      cycleEfficiency: round(cycleEfficiency),
      fuelAccuracyTrend
    };
  }).sort((a, b) => b.reliabilityAdjustedEpa - a.reliabilityAdjustedEpa);
}

function scoutAgreement(entries: MatchScoutEntry[]) {
  if (entries.length < 2) return 55;
  const totals = entries.map((entry) => entry.autoFuelMade + entry.teleFuelMade + entry.defenseRating * 2);
  return clamp(100 - standardDeviation(totals) * 3.4);
}

function assignArchetype(values: {
  adjustedEpa: number;
  reliabilityAdjustedEpa: number;
  fuelAccuracy: number;
  avgCycles: number;
  climbSuccessRate: number;
  defenseImpact: number;
  reliabilityScore: number;
  volatility: number;
  confidence: number;
}): TeamArchetype {
  if (values.confidence < 35) return "Data insufficient";
  if (values.reliabilityAdjustedEpa > 150 && values.reliabilityScore > 82) return "Elite carry bot";
  if (values.adjustedEpa > 125 && values.avgCycles >= 4) return "High-volume scorer";
  if (values.fuelAccuracy > 78 && values.adjustedEpa > 95) return "Efficient sniper";
  if (values.avgCycles >= 4.5 && values.reliabilityScore > 70) return "Cycle merchant";
  if (values.climbSuccessRate > 82 && values.adjustedEpa < 95) return "Climb specialist";
  if (values.defenseImpact > 72) return "Defensive menace";
  if (values.volatility > 18) return "Volatile boom/bust bot";
  if (values.reliabilityScore > 86 && values.adjustedEpa < 95) return "Low-risk support bot";
  if (values.adjustedEpa < 35) return "Practice bot / avoid";
  return "Cycle merchant";
}

function explainArchetype(archetype: TeamArchetype) {
  const explanations: Record<TeamArchetype, string> = {
    "Elite carry bot": "High adjusted EPA with enough reliability to anchor an alliance.",
    "High-volume scorer": "Large scoring load and enough cycles to absorb defensive pressure.",
    "Efficient sniper": "Accuracy is the value driver; protect clean sightlines and reduce traffic.",
    "Cycle merchant": "Wins through repeated clean cycles more than single-match ceiling.",
    "Climb specialist": "Endgame value is the main differentiator.",
    "Defensive menace": "Creates value by lowering opponent EPA and disrupting cycles.",
    "Low-risk support bot": "Reliable, role-complete, and unlikely to sink an alliance.",
    "Volatile boom/bust bot": "High ceiling, but match-to-match variance needs planning.",
    "Practice bot / avoid": "Low current value unless pit scouting finds hidden upside.",
    "Data insufficient": "Scout sample is too thin for a strong classification."
  };
  return explanations[archetype];
}

