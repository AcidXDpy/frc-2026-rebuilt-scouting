"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, Save, Target } from "lucide-react";
import { ModelExplanation, PredictionMeter, StrategyRecommendationCard } from "@/components/analytics-widgets";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { PageHeading } from "@/components/page-heading";
import { event, matches, matchEntries, teams } from "@/lib/sample-data";
import { calculateAdvancedTeamMetrics } from "@/lib/advanced-metrics";
import { defensiveMatchupModel } from "@/lib/models/defenseImpactModel";
import { monteCarloMatchSimulator } from "@/lib/models/matchPredictionModel";
import { allianceSynergyModel } from "@/lib/models/picklistModel";

export default function StrategyPage() {
  const [matchNumber, setMatchNumber] = useState(5);
  const [autoNotes, setAutoNotes] = useState("Protect center pickup lane; avoid crossing partner path during first 5 seconds.");
  const [defenseNotes, setDefenseNotes] = useState("Use the best defender against the opponent's highest adjusted EPA robot after their second cycle.");
  const metrics = useMemo(() => calculateAdvancedTeamMetrics(teams, matchEntries, event.gameConfig), []);
  const match = matches.find((item) => item.number === matchNumber) ?? matches[0];
  const red = match.red.map((team) => metrics.find((metric) => metric.teamNumber === team)).filter(Boolean) as typeof metrics;
  const blue = match.blue.map((team) => metrics.find((metric) => metric.teamNumber === team)).filter(Boolean) as typeof metrics;
  const prediction = useMemo(() => monteCarloMatchSimulator(match.red, match.blue, metrics, 5000), [match, metrics]);
  const redSynergy = allianceSynergyModel(match.red, metrics);
  const blueSynergy = allianceSynergyModel(match.blue, metrics);
  const redBestDefender = [...red].sort((a, b) => b.defenseImpact - a.defenseImpact)[0];
  const blueBestScorer = [...blue].sort((a, b) => b.adjustedEpa - a.adjustedEpa)[0];
  const matchup = defensiveMatchupModel(redBestDefender, blueBestScorer);
  const autoAdvantage = sum(red, "autoEpa") - sum(blue, "autoEpa");
  const teleAdvantage = sum(red, "teleopEpa") - sum(blue, "teleopEpa");
  const endgameAdvantage = sum(red, "endgameEpa") - sum(blue, "endgameEpa");

  function savePlan() {
    localStorage.setItem(`strategy-qm-${match.number}`, JSON.stringify({ match, prediction: prediction.prediction, redSynergy: redSynergy.prediction, blueSynergy: blueSynergy.prediction, autoNotes, defenseNotes, savedAt: new Date().toISOString() }));
    alert("Strategy intelligence plan saved locally.");
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <PageHeading className="flex-1" eyebrow="match intelligence" title="Strategy Planner" description="Monte Carlo predictions, synergy fit, defensive assignments, danger alerts, and recommended paths to win." />
        <div className="sm:w-48"><Label>Upcoming Match</Label><Select value={matchNumber} onChange={(event) => setMatchNumber(Number(event.target.value))}>{matches.map((item) => <option key={item.id} value={item.number}>QM {item.number}</option>)}</Select></div>
      </div>

      <section className="grid gap-4 xl:grid-cols-[1.2fr_1fr_1fr]">
        <Card className="overflow-hidden">
          <div className="gold-rule" />
          <CardHeader><CardTitle>Monte Carlo Prediction</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-center">
              <ScoreBox label="Red" score={prediction.prediction.predictedRedScore} win={prediction.prediction.redWinProb} />
              <ScoreBox label="Blue" score={prediction.prediction.predictedBlueScore} win={prediction.prediction.blueWinProb} />
            </div>
            <PredictionMeter label="Red win probability" value={prediction.prediction.redWinProb} />
            <p className="text-sm text-muted-foreground">{prediction.explanation}</p>
          </CardContent>
        </Card>
        <AdvantageCard auto={autoAdvantage} tele={teleAdvantage} endgame={endgameAdvantage} />
        <Card className="overflow-hidden">
          <div className="gold-rule" />
          <CardHeader><CardTitle>Defense Threat</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p className="font-semibold">{matchup.prediction.assignment}</p>
            <p className="text-muted-foreground">{matchup.explanation}</p>
            <PredictionMeter label="Estimated EPA suppression" value={matchup.prediction.epaSuppression * 5} />
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <ModelExplanation title="Red Alliance Synergy" output={redSynergy} />
        <ModelExplanation title="Blue Alliance Synergy" output={blueSynergy} />
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <StrategyRecommendationCard title="Safest Path To Win" items={[
          `Protect ${bestScorer(red).teamNumber}'s cycle lane and keep them away from cross-field traffic.`,
          `Bank endgame with ${bestClimber(red).teamNumber}; leave a 12-second climb buffer.`,
          `Use ${redBestDefender.teamNumber} only after auto unless red falls behind by more than 18 EPA.`
        ]} />
        <StrategyRecommendationCard title="High-Risk High-Reward Path" items={[
          `Send ${redBestDefender.teamNumber} at ${blueBestScorer.teamNumber} for full teleop pressure.`,
          `Allow ${bestScorer(red).teamNumber} to take aggressive Hub shots if protected by partner screens.`,
          "Trade climb safety for one extra late cycle only if win probability is below 42%."
        ]} />
        <StrategyRecommendationCard title="Danger Alerts" danger items={[
          prediction.prediction.upsetRisk > 25 ? `Upset risk ${prediction.prediction.upsetRisk}%: avoid fouls and connection-risk plays.` : "Upset risk is controlled if red avoids penalties.",
          redSynergy.prediction.warnings[0] ?? "No major red synergy conflict.",
          blueSynergy.prediction.warnings[0] ? `Opponent weakness: ${blueSynergy.prediction.warnings[0]}` : "Opponent has no obvious synergy warning."
        ]} />
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <Card><CardHeader><CardTitle>Recommended Robot Roles</CardTitle></CardHeader><CardContent className="space-y-2">{Object.entries(redSynergy.prediction.recommendedRoles).map(([team, role]) => <div key={team} className="rounded-md border p-3"><b>{team}</b><p className="text-sm text-muted-foreground">{role}</p></div>)}</CardContent></Card>
        <Card><CardHeader><CardTitle>Keys To The Match</CardTitle></CardHeader><CardContent className="space-y-2">{prediction.prediction.decidingFactors.map((factor) => <p key={factor} className="rounded-md border p-3 text-sm"><Target className="mr-2 inline h-4 w-4 text-primary" />{factor}</p>)}</CardContent></Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card><CardHeader><CardTitle>Auto Path Notes</CardTitle></CardHeader><CardContent><Textarea value={autoNotes} onChange={(event) => setAutoNotes(event.target.value)} /></CardContent></Card>
        <Card><CardHeader><CardTitle>Defense Assignment Notes</CardTitle></CardHeader><CardContent><Textarea value={defenseNotes} onChange={(event) => setDefenseNotes(event.target.value)} /></CardContent></Card>
      </section>

      <Button onClick={savePlan}><Save className="h-4 w-4" /> Save strategy intelligence plan</Button>
    </div>
  );
}

function ScoreBox({ label, score, win }: { label: string; score: number; win: number }) {
  return <div className="rounded-lg border border-primary/20 bg-black/20 p-4"><p className="text-sm text-muted-foreground">{label}</p><p className="text-4xl font-black text-primary">{score}</p><p className="text-xs">{win}% win</p></div>;
}

function AdvantageCard({ auto, tele, endgame }: { auto: number; tele: number; endgame: number }) {
  return <Card className="overflow-hidden"><div className="gold-rule" /><CardHeader><CardTitle>Phase Advantage</CardTitle></CardHeader><CardContent className="space-y-3"><Adv label="Auto" value={auto} /><Adv label="Teleop" value={tele} /><Adv label="Endgame" value={endgame} /></CardContent></Card>;
}

function Adv({ label, value }: { label: string; value: number }) {
  return <div className="flex items-center justify-between rounded-md border p-3"><span>{label}</span><span className={value >= 0 ? "font-black text-primary" : "font-black text-red-400"}>{value >= 0 ? "+" : ""}{value.toFixed(1)}</span></div>;
}

function sum(teams: ReturnType<typeof calculateAdvancedTeamMetrics>, key: "autoEpa" | "teleopEpa" | "endgameEpa") {
  return teams.reduce((total, team) => total + team[key], 0);
}

function bestScorer(teams: ReturnType<typeof calculateAdvancedTeamMetrics>) {
  return [...teams].sort((a, b) => b.adjustedEpa - a.adjustedEpa)[0];
}

function bestClimber(teams: ReturnType<typeof calculateAdvancedTeamMetrics>) {
  return [...teams].sort((a, b) => b.climbSuccessProbability - a.climbSuccessProbability)[0];
}
