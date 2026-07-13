"use client";

import { useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, ResponsiveContainer, Scatter, ScatterChart, Tooltip, XAxis, YAxis } from "recharts";
import { BrainCircuit, DatabaseZap, FlaskConical, Network, SearchCode } from "lucide-react";
import { ConfidenceBar, RiskBadge } from "@/components/analytics-widgets";
import { PageHeading } from "@/components/page-heading";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Table, Td, Th } from "@/components/ui/table";
import { event, matchEntries, teams } from "@/lib/sample-data";
import { calculateAdvancedTeamMetrics } from "@/lib/advanced-metrics";
import { buildMlLab, findSimilarTeams, whatIfSimulator } from "@/lib/ml/model-lab";

export default function MlLabPage() {
  const metrics = useMemo(() => calculateAdvancedTeamMetrics(teams, matchEntries, event.gameConfig), []);
  const lab = useMemo(() => buildMlLab(metrics), [metrics]);
  const [selectedTeam, setSelectedTeam] = useState(11);
  const selected = metrics.find((team) => team.teamNumber === selectedTeam) ?? metrics[0];
  const similar = findSimilarTeams(selected.teamNumber, metrics);
  const [cycleEfficiency, setCycleEfficiency] = useState(selected.cycleEfficiency);
  const [climbProbability, setClimbProbability] = useState(selected.climbSuccessProbability);
  const [foulRisk, setFoulRisk] = useState(selected.foulRisk);
  const [breakdownRisk, setBreakdownRisk] = useState(selected.breakdownRisk);
  const whatIf = whatIfSimulator(selected, { cycleEfficiency, climbSuccessProbability: climbProbability, foulRisk, breakdownRisk });

  function resetTeam(teamNumber: number) {
    const team = metrics.find((metric) => metric.teamNumber === teamNumber) ?? metrics[0];
    setSelectedTeam(team.teamNumber);
    setCycleEfficiency(team.cycleEfficiency);
    setClimbProbability(team.climbSuccessProbability);
    setFoulRisk(team.foulRisk);
    setBreakdownRisk(team.breakdownRisk);
  }

  return (
    <div className="space-y-5">
      <PageHeading eyebrow="model lab" title="Machine Learning Strategy Lab" description="Feature importance, model leaderboard, KNN similar teams, anomaly detection, what-if simulation, and alliance optimization. Built on current FMA DCMP rankings, OPR, and generated scouting baselines." />

      <section className="grid gap-4 lg:grid-cols-4">
        <Stat title="Training Rows" value={lab.vectors.length} icon={<DatabaseZap className="h-5 w-5 text-primary" />} />
        <Stat title="Features" value={Object.keys(lab.vectors[0]?.features ?? {}).length} icon={<SearchCode className="h-5 w-5 text-primary" />} />
        <Stat title="Best Model" value={lab.leaderboard[0]?.pseudoR2 ?? 0} suffix="% fit" icon={<BrainCircuit className="h-5 w-5 text-primary" />} />
        <Stat title="Watchlist" value={lab.anomalies.length} icon={<FlaskConical className="h-5 w-5 text-primary" />} />
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <Card className="overflow-hidden">
          <div className="gold-rule" />
          <CardHeader><CardTitle>Model Leaderboard</CardTitle></CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <thead><tr><Th>Model</Th><Th>Target</Th><Th>Pseudo R2</Th><Th>MAE</Th><Th>Confidence</Th><Th>Explanation</Th></tr></thead>
              <tbody>
                {lab.leaderboard.map((row) => (
                  <tr key={row.name} className="border-t">
                    <Td><b>{row.name}</b></Td>
                    <Td>{row.predictionTarget}</Td>
                    <Td>{row.pseudoR2}%</Td>
                    <Td>{row.meanAbsoluteError}</Td>
                    <Td><div className="min-w-28"><ConfidenceBar value={row.confidence} /></div></Td>
                    <Td className="max-w-md text-muted-foreground">{row.explanation}</Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <div className="gold-rule" />
          <CardHeader><CardTitle>Feature Importance</CardTitle></CardHeader>
          <CardContent className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={lab.importances.slice(0, 10)} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" opacity={0.18} />
                <XAxis type="number" />
                <YAxis dataKey="feature" type="category" width={120} />
                <Tooltip />
                <Bar dataKey="importance">
                  {lab.importances.slice(0, 10).map((feature) => <Cell key={feature.feature} fill={feature.direction === "positive" ? "#ffcc00" : "#ef4444"} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <Card className="overflow-hidden">
          <div className="gold-rule" />
          <CardHeader><CardTitle>KNN Similar Team Finder</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div><Label>Team</Label><Select value={selectedTeam} onChange={(event) => resetTeam(Number(event.target.value))}>{metrics.map((team) => <option key={team.teamNumber} value={team.teamNumber}>{team.teamNumber} · {team.teamName}</option>)}</Select></div>
            {similar.map((team) => <div key={team.teamNumber} className="rounded-md border p-3 text-sm"><div className="flex items-center justify-between"><b>{team.teamNumber} {team.teamName}</b><Badge>{team.distance}</Badge></div><p className="text-xs text-muted-foreground">{team.archetype} · Adj EPA {team.adjustedEpa}</p></div>)}
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <div className="gold-rule" />
          <CardHeader><CardTitle>What-If Simulator</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <Slider label="Cycle efficiency" value={cycleEfficiency} onChange={setCycleEfficiency} />
            <Slider label="Climb probability" value={climbProbability} onChange={setClimbProbability} />
            <Slider label="Foul risk" value={foulRisk} onChange={setFoulRisk} />
            <Slider label="Breakdown risk" value={breakdownRisk} onChange={setBreakdownRisk} />
            <div className="rounded-md border border-primary/20 p-3">
              <p className="text-xs text-muted-foreground">Projected pick value</p>
              <p className="text-3xl font-black text-primary">{whatIf.projectedPickValue} <span className={whatIf.delta >= 0 ? "text-base text-emerald-400" : "text-base text-red-400"}>{whatIf.delta >= 0 ? "+" : ""}{whatIf.delta}</span></p>
              <p className="mt-2 text-sm text-muted-foreground">{whatIf.explanation}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <div className="gold-rule" />
          <CardHeader><CardTitle>Anomaly Watchlist</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {lab.anomalies.slice(0, 8).map((item) => <div key={item.teamNumber} className="rounded-md border p-3 text-sm"><div className="flex items-center justify-between"><b>{item.teamNumber} {item.teamName}</b><RiskBadge value={item.anomalyScore} /></div><p className="text-xs text-muted-foreground">{item.reason}</p></div>)}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1fr_1fr]">
        <Card className="overflow-hidden">
          <div className="gold-rule" />
          <CardHeader><CardTitle className="flex items-center gap-2"><Network className="h-5 w-5 text-primary" /> Optimized Alliance Combos</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {lab.optimizedAlliances.map((alliance, index) => <div key={alliance.teams.join("-")} className="rounded-md border p-3 text-sm"><div className="flex flex-wrap items-center justify-between gap-2"><b>#{index + 1} · {alliance.teams.join(" / ")}</b><Badge>Score {alliance.score}</Badge></div><p className="text-xs text-muted-foreground">Ceiling {alliance.ceiling} · Risk {alliance.risk}. {alliance.explanation}</p></div>)}
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <div className="gold-rule" />
          <CardHeader><CardTitle>Feature Space Map</CardTitle></CardHeader>
          <CardContent className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" opacity={0.18} />
                <XAxis dataKey="opr" name="OPR" />
                <YAxis dataKey="pickValue" name="Pick value" />
                <Tooltip />
                <Scatter data={metrics} fill="#ffcc00">
                  {metrics.map((team) => <Cell key={team.teamNumber} fill={team.teamNumber === selectedTeam ? "#ef4444" : "#ffcc00"} />)}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </section>

      <Card className="overflow-hidden">
        <div className="gold-rule" />
        <CardHeader><CardTitle>Model Drift Proxy</CardTitle></CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={metrics.slice(0, 24).map((team, index) => ({ index, team: team.teamNumber, opr: team.opr, model: team.reliabilityAdjustedEpa, gap: team.reliabilityAdjustedEpa - team.opr }))}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.18} />
              <XAxis dataKey="team" />
              <YAxis />
              <Tooltip />
              <Line dataKey="opr" stroke="#9ca3af" strokeWidth={2} name="Imported OPR" />
              <Line dataKey="model" stroke="#ffcc00" strokeWidth={3} name="Model strength" />
              <Line dataKey="gap" stroke="#ef4444" strokeWidth={2} name="Model gap" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

function Stat({ title, value, suffix = "", icon }: { title: string; value: string | number; suffix?: string; icon: React.ReactNode }) {
  return <Card className="overflow-hidden"><div className="gold-rule" /><CardContent className="flex items-center justify-between gap-3 pt-4"><div><p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{title}</p><p className="text-2xl font-black text-primary">{value}{suffix}</p></div>{icon}</CardContent></Card>;
}

function Slider({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return <div><div className="mb-1 flex justify-between text-xs"><Label>{label}</Label><span>{Math.round(value)}</span></div><Input type="range" min={0} max={100} value={value} onChange={(event) => onChange(Number(event.target.value))} /></div>;
}
