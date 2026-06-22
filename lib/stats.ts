import type { GameConfig, Match, MatchScoutEntry, PickWeights, StrategyPrediction, Team, TeamMetric } from "@/lib/types";

const avg = (values: number[]) => (values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0);
const clamp = (value: number, min = 0, max = 1) => Math.max(min, Math.min(max, value));
const round = (value: number, places = 1) => Number(value.toFixed(places));

export function scoreEntry(entry: MatchScoutEntry, config: GameConfig) {
  const auto = entry.autoFuelMade * config.pointValues.autoFuel;
  const teleop = entry.teleFuelMade * config.pointValues.teleopFuel;
  const endgame = config.pointValues.climb[entry.towerClimbLevel] ?? 0;
  const penalties = (entry.penalties + entry.fouls) * config.pointValues.foulPenalty;
  return { auto, teleop, endgame, penalties, total: auto + teleop + endgame - penalties };
}

export function calculateTeamMetrics(teams: Team[], entries: MatchScoutEntry[], config: GameConfig): TeamMetric[] {
  return teams.map((team) => {
    const teamEntries = entries.filter((entry) => entry.teamNumber === team.number);
    const scores = teamEntries.map((entry) => scoreEntry(entry, config));
    const totals = scores.map((score) => score.total);
    const attempts = teamEntries.reduce((sum, entry) => sum + entry.autoFuelAttempted + entry.teleFuelAttempted, 0);
    const makes = teamEntries.reduce((sum, entry) => sum + entry.autoFuelMade + entry.teleFuelMade, 0);
    const allCycles = teamEntries.flatMap((entry) => entry.cycleTimes);
    const disabledRate = avg(teamEntries.map((entry) => (entry.disabled || entry.tipped || entry.connectionIssues ? 1 : 0)));
    const reliability = clamp(1 - disabledRate - avg(teamEntries.map((entry) => entry.breakdowns ? 0.12 : 0)), 0, 1) * 100;
    const consistency = totals.length > 1 ? clamp(1 - standardDeviation(totals) / Math.max(avg(totals), 1), 0, 1) * 100 : 60;
    const confidence = clamp(teamEntries.length / 6, 0.25, 1);
    const scoring = avg(scores.map((score) => score.auto + score.teleop));
    const defenseAdjusted = scoring * (1 - avg(teamEntries.map((entry) => entry.defenseRating)) * 0.015);
    const epaLike = defenseAdjusted * 0.62 + avg(scores.map((score) => score.endgame)) * 0.23 + reliability * 0.15;
    const ciSpread = teamEntries.length > 1 ? 1.96 * standardDeviation(totals) / Math.sqrt(teamEntries.length) : 14;
    const confidenceInterval: [number, number] = [round(avg(totals) - ciSpread), round(avg(totals) + ciSpread)];

    return {
      teamNumber: team.number,
      teamName: team.name,
      matchesPlayed: teamEntries.length,
      autoScore: round(avg(scores.map((score) => score.auto))),
      teleopScore: round(avg(scores.map((score) => score.teleop))),
      endgameScore: round(avg(scores.map((score) => score.endgame))),
      fuelAccuracy: round(attempts ? (makes / attempts) * 100 : 0),
      averageCycles: round(avg(teamEntries.map((entry) => entry.cycleTimes.length))),
      climbSuccessRate: round(avg(teamEntries.map((entry) => entry.climbSuccess ? 1 : 0)) * 100),
      defensiveImpact: round(avg(teamEntries.map((entry) => entry.defenseRating)) * 20),
      consistency: round(consistency),
      reliability: round(reliability),
      epaLikeRating: round(epaLike),
      eloRating: round(1500 + (epaLike - 55) * 9 + consistency),
      oprEstimate: round(avg(totals)),
      confidence: round(confidence * 100),
      confidenceInterval,
      disabledRate: round(disabledRate * 100)
    };
  }).sort((a, b) => b.epaLikeRating - a.epaLikeRating);
}

export function standardDeviation(values: number[]) {
  if (values.length < 2) return 0;
  const mean = avg(values);
  return Math.sqrt(avg(values.map((value) => (value - mean) ** 2)));
}

export function weightedPickScore(metric: TeamMetric, weights: PickWeights) {
  const scoring = metric.teleopScore + metric.autoScore;
  const climb = metric.endgameScore * metric.climbSuccessRate / 100;
  return round(
    weights.scoringWeight * scoring +
    weights.climbWeight * climb +
    weights.reliabilityWeight * metric.reliability +
    weights.defenseWeight * metric.defensiveImpact +
    weights.consistencyWeight * metric.consistency +
    weights.autoWeight * metric.autoScore,
    2
  );
}

export function predictMatch(ourTeams: number[], opponentTeams: number[], metrics: TeamMetric[], config: GameConfig): StrategyPrediction {
  const scoreAlliance = (teamNumbers: number[]) => {
    const teamMetrics = teamNumbers.map((number) => metrics.find((metric) => metric.teamNumber === number)).filter(Boolean) as TeamMetric[];
    const auto = teamMetrics.reduce((sum, metric) => sum + metric.autoScore, 0);
    const teleop = teamMetrics.reduce((sum, metric) => sum + metric.teleopScore, 0);
    const endgame = teamMetrics.reduce((sum, metric) => sum + metric.endgameScore, 0);
    const reliability = avg(teamMetrics.map((metric) => metric.reliability)) / 100;
    const defense = avg(teamMetrics.map((metric) => metric.defensiveImpact)) / 100;
    const synergy = clamp((reliability * 0.7 + defense * 0.3) + roleDiversityBonus(teamMetrics), 0.65, 1.18);
    return { auto, teleop, endgame, total: (auto + teleop + endgame) * synergy, synergy };
  };
  const alliance = scoreAlliance(ourTeams);
  const opponent = scoreAlliance(opponentTeams);
  const diff = alliance.total - opponent.total;
  const winProbability = clamp(1 / (1 + Math.exp(-diff / 22)), 0.03, 0.97);
  const warnings = metrics
    .filter((metric) => ourTeams.includes(metric.teamNumber))
    .flatMap((metric) => [
      metric.confidence < 50 ? `${metric.teamNumber}: low sample confidence` : "",
      metric.disabledRate > 10 ? `${metric.teamNumber}: reliability risk` : "",
      metric.climbSuccessRate < 55 ? `${metric.teamNumber}: climb backup needed` : ""
    ])
    .filter(Boolean);

  return {
    allianceScore: round(alliance.total),
    opponentScore: round(opponent.total),
    winProbability: round(winProbability * 100),
    scoreBreakdown: {
      auto: round(alliance.auto),
      teleop: round(alliance.teleop),
      endgame: round(alliance.endgame),
      penalties: config.pointValues.foulPenalty
    },
    synergy: round(alliance.synergy * 100),
    warnings
  };
}

function roleDiversityBonus(teamMetrics: TeamMetric[]) {
  const hasDefense = teamMetrics.some((metric) => metric.defensiveImpact > 70);
  const hasClimb = teamMetrics.some((metric) => metric.climbSuccessRate > 80);
  const hasAuto = teamMetrics.some((metric) => metric.autoScore > 25);
  return [hasDefense, hasClimb, hasAuto].filter(Boolean).length * 0.035;
}

export function detectQualityIssues(entries: MatchScoutEntry[], metrics: TeamMetric[]) {
  const duplicated = entries.filter((entry, index) => entries.findIndex((candidate) => candidate.matchId === entry.matchId && candidate.teamNumber === entry.teamNumber) !== index);
  const impossible = entries.filter((entry) => entry.autoFuelMade > entry.autoFuelAttempted || entry.teleFuelMade > entry.teleFuelAttempted || entry.cycleTimes.some((time) => time < 4 || time > 90));
  const suspicious = metrics.filter((metric) => metric.confidence < 45 || metric.disabledRate > 20 || metric.fuelAccuracy > 95);
  const missingTeams = metrics.filter((metric) => metric.matchesPlayed === 0);
  return { duplicated, impossible, suspicious, missingTeams };
}

export function exportCsv(rows: Record<string, unknown>[]) {
  if (!rows.length) return "";
  const headers = Object.keys(rows[0]);
  const escape = (value: unknown) => `"${String(Array.isArray(value) ? value.join("; ") : value ?? "").replace(/"/g, '""')}"`;
  return [headers.join(","), ...rows.map((row) => headers.map((header) => escape(row[header])).join(","))].join("\n");
}

export function parseCsv(text: string) {
  const [headerLine, ...lines] = text.trim().split(/\r?\n/);
  const headers = headerLine.split(",").map((header) => header.trim());
  return lines.map((line) => {
    const cells = line.match(/("([^"]|"")*"|[^,]+)/g)?.map((cell) => cell.replace(/^"|"$/g, "").replace(/""/g, "\"")) ?? [];
    return Object.fromEntries(headers.map((header, index) => [header, cells[index] ?? ""]));
  });
}
