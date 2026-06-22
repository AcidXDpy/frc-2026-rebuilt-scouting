"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { event, matches, matchEntries, teams } from "@/lib/sample-data";
import { calculateTeamMetrics, predictMatch } from "@/lib/stats";

export default function StrategyPage() {
  const [matchNumber, setMatchNumber] = useState(4);
  const [autoNotes, setAutoNotes] = useState("Protect center pickup lane; avoid crossing partner path during first 5 seconds.");
  const [defenseNotes, setDefenseNotes] = useState("Send lowest fuel ceiling robot to slow opponent primary scorer after second cycle.");
  const match = matches.find((item) => item.number === matchNumber) ?? matches[0];
  const metrics = calculateTeamMetrics(teams, matchEntries, event.gameConfig);
  const prediction = useMemo(() => predictMatch(match.red, match.blue, metrics, event.gameConfig), [match, metrics]);
  const roleFor = (team: number) => {
    const metric = metrics.find((item) => item.teamNumber === team);
    if (!metric) return "Scout before assigning";
    if (metric.defensiveImpact > 75) return "Defender / disrupt hub lane";
    if (metric.autoScore > 28) return "Primary auto scorer";
    if (metric.climbSuccessRate > 85) return "Endgame anchor";
    return "Cycle scorer / support";
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div><h1 className="text-2xl font-bold">Match Strategy Planner</h1><p className="text-sm text-muted-foreground">Alliance comparison, roles, predicted score, risks, auto notes, and defensive assignments.</p></div>
        <div className="sm:w-48"><Label>Upcoming Match</Label><Select value={matchNumber} onChange={(event) => setMatchNumber(Number(event.target.value))}>{matches.map((item) => <option key={item.id} value={item.number}>QM {item.number}</option>)}</Select></div>
      </div>
      <section className="grid gap-4 lg:grid-cols-3">
        <Card><CardHeader><CardTitle>Red Alliance</CardTitle></CardHeader><CardContent className="space-y-2">{match.red.map((team) => <RoleRow key={team} team={team} role={roleFor(team)} />)}</CardContent></Card>
        <Card><CardHeader><CardTitle>Blue Alliance</CardTitle></CardHeader><CardContent className="space-y-2">{match.blue.map((team) => <RoleRow key={team} team={team} role={roleFor(team)} />)}</CardContent></Card>
        <Card><CardHeader><CardTitle>Prediction</CardTitle></CardHeader><CardContent className="space-y-3"><div className="grid grid-cols-2 gap-2 text-center"><div className="rounded-md bg-muted p-3"><b>{prediction.allianceScore}</b><p className="text-xs">Red</p></div><div className="rounded-md bg-muted p-3"><b>{prediction.opponentScore}</b><p className="text-xs">Blue</p></div></div><p className="text-sm">{prediction.winProbability}% red win probability · synergy {prediction.synergy}%</p><p className="text-xs text-muted-foreground">Auto {prediction.scoreBreakdown.auto} · Tele {prediction.scoreBreakdown.teleop} · Endgame {prediction.scoreBreakdown.endgame}</p></CardContent></Card>
      </section>
      <section className="grid gap-4 lg:grid-cols-2">
        <Card><CardHeader><CardTitle>Auto Path Planner</CardTitle></CardHeader><CardContent><Textarea value={autoNotes} onChange={(event) => setAutoNotes(event.target.value)} /></CardContent></Card>
        <Card><CardHeader><CardTitle>Defense Assignments</CardTitle></CardHeader><CardContent><Textarea value={defenseNotes} onChange={(event) => setDefenseNotes(event.target.value)} /></CardContent></Card>
      </section>
      <Card><CardHeader><CardTitle className="flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-destructive" /> Risk Warnings</CardTitle></CardHeader><CardContent className="space-y-2">{prediction.warnings.length ? prediction.warnings.map((warning) => <p className="rounded-md border p-3 text-sm" key={warning}>{warning}</p>) : <p className="text-sm text-muted-foreground">No major warnings for this alliance.</p>}<Button onClick={() => { localStorage.setItem(`strategy-qm-${match.number}`, JSON.stringify({ match, prediction, autoNotes, defenseNotes, savedAt: new Date().toISOString() })); alert("Strategy plan saved locally."); }}><Target className="h-4 w-4" /> Save strategy plan locally</Button></CardContent></Card>
    </div>
  );
}

function RoleRow({ team, role }: { team: number; role: string }) {
  return <div className="rounded-md border p-3"><p className="font-semibold">{team}</p><p className="text-sm text-muted-foreground">{role}</p></div>;
}
