"use client";

import type React from "react";
import { useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, Cell, ComposedChart, Legend, Line, LineChart, Radar, RadarChart, PolarAngleAxis, PolarGrid, PolarRadiusAxis, ResponsiveContainer, Scatter, ScatterChart, Tooltip, XAxis, YAxis } from "recharts";
import { ArchetypeBadge, ConfidenceBar, RiskBadge, TeamBadge } from "@/components/analytics-widgets";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Table, Td, Th } from "@/components/ui/table";
import { event, matchEntries, teams } from "@/lib/sample-data";
import { calculateAdvancedTeamMetrics } from "@/lib/advanced-metrics";
import { bayesianTeamStrengthEstimate, eloStyleRating } from "@/lib/models/teamRatingModel";
import { reliabilityModel } from "@/lib/models/reliabilityModel";

export default function AnalyticsPage() {
  const [selectedTeam, setSelectedTeam] = useState(11);
  const metrics = useMemo(() => calculateAdvancedTeamMetrics(teams, matchEntries, event.gameConfig), []);
  const selected = metrics.find((team) => team.teamNumber === selectedTeam) ?? metrics[0];
  const bestSecondPicks = metrics.filter((team) => team.reliabilityAdjustedEpa < 150 && team.breakdownRisk < 25).slice(0, 8);
  const underrated = [...metrics].sort((a, b) => (b.pickValue - b.opr * 0.12) - (a.pickValue - a.opr * 0.12)).slice(0, 8);
  const overrated = [...metrics].sort((a, b) => (b.opr - b.reliabilityAdjustedEpa) - (a.opr - a.reliabilityAdjustedEpa)).slice(0, 8);
  const fastestImproving = [...metrics].sort((a, b) => trendSlope(b.trend) - trendSlope(a.trend)).slice(0, 8);
  const radarData = [
    { axis: "EPA", value: selected.adjustedEpa },
    { axis: "Auto", value: selected.autoEpa * 3 },
    { axis: "Climb", value: selected.climbSuccessProbability },
    { axis: "Defense", value: selected.defenseImpact },
    { axis: "Reliability", value: 100 - selected.breakdownRisk },
    { axis: "Consistency", value: selected.consistency }
  ];

  return (
    <div className="space-y-5">
      <div className="rounded-lg border border-primary/25 bg-[#050505] p-5 text-white shadow-[0_20px_60px_rgba(0,0,0,0.25)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary">M.O.R.T. strategy intelligence</p>
            <h1 className="mt-2 text-3xl font-black">Advanced Analytics War Room</h1>
            <p className="max-w-3xl text-sm text-zinc-300">Explainable EPA, Monte Carlo-ready metrics, archetype clustering, risk scoring, and pick value modeling from FMA DCMP data.</p>
          </div>
          <div className="w-full lg:w-72">
            <Select value={selectedTeam} onChange={(event) => setSelectedTeam(Number(event.target.value))}>
              {metrics.map((team) => <option key={team.teamNumber} value={team.teamNumber}>{team.teamNumber} · {team.teamName}</option>)}
            </Select>
          </div>
        </div>
      </div>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <WarRoomList title="Best Overall Robots" teams={metrics.slice(0, 5)} />
        <WarRoomList title="Best First Picks" teams={[...metrics].sort((a, b) => b.adjustedEpa - a.adjustedEpa).slice(0, 5)} />
        <WarRoomList title="Best Second Picks" teams={bestSecondPicks} />
        <WarRoomList title="Underranked Gems" teams={underrated} />
        <WarRoomList title="Biggest Risk" teams={[...metrics].sort((a, b) => b.boomBustRisk - a.boomBustRisk).slice(0, 5)} risk />
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
        <Card className="overflow-hidden">
          <div className="gold-rule" />
          <CardHeader><CardTitle>EPA By Phase</CardTitle></CardHeader>
          <CardContent className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics.slice(0, 14)}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.18} />
                <XAxis dataKey="teamNumber" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="autoEpa" stackId="a" fill="#ffcc00" name="Auto EPA" />
                <Bar dataKey="teleopEpa" stackId="a" fill="#9ca3af" name="Teleop EPA" />
                <Bar dataKey="endgameEpa" stackId="a" fill="#ef4444" name="Endgame EPA" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="overflow-hidden">
          <div className="gold-rule" />
          <CardHeader><CardTitle>{selected.teamNumber} Intelligence Profile</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <TeamBadge team={selected} />
            <ArchetypeBadge archetype={selected.archetype} />
            <p className="text-sm text-muted-foreground">{selected.archetypeExplanation}</p>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <Metric label="Bayesian" value={bayesianTeamStrengthEstimate(selected).prediction} />
              <Metric label="Elo-style" value={eloStyleRating(selected).prediction} />
              <Metric label="Reliability" value={`${reliabilityModel(selected).prediction}%`} />
              <Metric label="Pick Value" value={selected.pickValue} />
            </div>
            <RadarChart outerRadius={90} width={340} height={250} data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="axis" />
              <PolarRadiusAxis angle={30} domain={[0, 220]} />
              <Radar dataKey="value" stroke="#ffcc00" fill="#ffcc00" fillOpacity={0.35} />
            </RadarChart>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <ChartCard title="Accuracy vs Cycle Speed">
          <ScatterChart>
            <CartesianGrid strokeDasharray="3 3" opacity={0.18} />
            <XAxis dataKey="cycleEfficiency" name="Cycle efficiency" />
            <YAxis dataKey="fuelAccuracy" name="Fuel accuracy" />
            <Tooltip cursor={{ strokeDasharray: "3 3" }} />
            <Scatter data={metrics} fill="#ffcc00">
              {metrics.map((team) => <Cell key={team.teamNumber} fill={team.teamNumber === selectedTeam ? "#ef4444" : "#ffcc00"} />)}
            </Scatter>
          </ScatterChart>
        </ChartCard>
        <ChartCard title="Reliability vs Ceiling">
          <ScatterChart>
            <CartesianGrid strokeDasharray="3 3" opacity={0.18} />
            <XAxis dataKey="breakdownRisk" name="Breakdown risk" />
            <YAxis dataKey="ceiling" name="Ceiling" />
            <Tooltip />
            <Scatter data={metrics} fill="#9ca3af" />
          </ScatterChart>
        </ChartCard>
        <ChartCard title="Volatility">
          <ComposedChart data={metrics.slice(0, 18)}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.18} />
            <XAxis dataKey="teamNumber" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="floor" fill="#374151" name="Floor" />
            <Line dataKey="ceiling" stroke="#ffcc00" strokeWidth={3} name="Ceiling" />
            <Line dataKey="volatility" stroke="#ef4444" strokeWidth={2} name="Volatility" />
          </ComposedChart>
        </ChartCard>
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <ChartCard title={`${selected.teamNumber} Trajectory`}>
          <LineChart data={selected.trend.map((value, index) => ({ match: index + 1, value, accuracy: selected.fuelAccuracyTrend[index] ?? selected.fuelAccuracy }))}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.18} />
            <XAxis dataKey="match" />
            <YAxis />
            <Tooltip />
            <Line dataKey="value" stroke="#ffcc00" strokeWidth={3} name="EPA trend" />
            <Line dataKey="accuracy" stroke="#ef4444" strokeWidth={2} name="Fuel accuracy" />
          </LineChart>
        </ChartCard>
        <WarRoomList title="Best Defensive Bots" teams={[...metrics].sort((a, b) => b.defenseImpact - a.defenseImpact).slice(0, 8)} />
        <WarRoomList title="Most Overrated by Raw OPR" teams={overrated} risk />
      </section>

      <Card>
        <CardHeader><CardTitle>Full Command Ranking</CardTitle></CardHeader>
        <CardContent className="max-h-[620px] overflow-auto">
          <Table>
            <thead className="sticky top-0 bg-card"><tr><Th>Team</Th><Th>Archetype</Th><Th>Adj EPA</Th><Th>Rel EPA</Th><Th>OPR</Th><Th>Ceiling</Th><Th>Risk</Th><Th>Confidence</Th></tr></thead>
            <tbody>
              {metrics.map((team) => (
                <tr key={team.teamNumber} className="border-t">
                  <Td><b>{team.teamNumber}</b><div className="text-xs text-muted-foreground">{team.teamName}</div></Td>
                  <Td><ArchetypeBadge archetype={team.archetype} /></Td>
                  <Td>{team.adjustedEpa}</Td>
                  <Td>{team.reliabilityAdjustedEpa}</Td>
                  <Td>{team.opr}</Td>
                  <Td>{team.ceiling}</Td>
                  <Td><RiskBadge value={team.boomBustRisk} /></Td>
                  <Td><div className="min-w-28"><ConfidenceBar value={team.confidence} /></div></Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function WarRoomList({ title, teams, risk }: { title: string; teams: ReturnType<typeof calculateAdvancedTeamMetrics>; risk?: boolean }) {
  return (
    <Card className="overflow-hidden">
      <div className="gold-rule" />
      <CardHeader className="pb-2"><CardTitle className="text-sm">{title}</CardTitle></CardHeader>
      <CardContent className="space-y-2">
        {teams.slice(0, 8).map((team, index) => (
          <div key={team.teamNumber} className="flex items-center justify-between gap-3 rounded-md border p-2 text-sm">
            <span><b>#{index + 1}</b> {team.teamNumber}</span>
            {risk ? <RiskBadge value={team.boomBustRisk} /> : <Badge>{team.pickValue}</Badge>}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactElement }) {
  return (
    <Card className="overflow-hidden">
      <div className="gold-rule" />
      <CardHeader><CardTitle>{title}</CardTitle></CardHeader>
      <CardContent className="h-80">
        <ResponsiveContainer width="100%" height="100%">{children}</ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return <div className="rounded-md border border-primary/20 p-3"><p className="text-xs text-muted-foreground">{label}</p><p className="text-xl font-black text-primary">{value}</p></div>;
}

function trendSlope(values: number[]) {
  if (values.length < 2) return 0;
  return values[values.length - 1] - values[0];
}
