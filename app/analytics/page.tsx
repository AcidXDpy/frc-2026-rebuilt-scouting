"use client";

import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, Td, Th } from "@/components/ui/table";
import { event, matchEntries, teams } from "@/lib/sample-data";
import { calculateTeamMetrics } from "@/lib/stats";

export default function AnalyticsPage() {
  const metrics = calculateTeamMetrics(teams, matchEntries, event.gameConfig);
  const trend = matchEntries.map((entry) => ({
    match: `QM${entry.matchNumber}`,
    team: entry.teamNumber,
    score: entry.autoFuelMade * event.gameConfig.pointValues.autoFuel + entry.teleFuelMade * event.gameConfig.pointValues.teleopFuel
  }));

  return (
    <div className="space-y-5">
      <div className="rounded-lg border border-primary/25 bg-[#050505] p-5 text-white shadow-[0_20px_60px_rgba(0,0,0,0.25)]">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary">M.O.R.T. strategy console</p>
        <h1 className="mt-2 text-3xl font-black">Analytics Dashboard</h1>
        <p className="text-sm text-muted-foreground">EPA-like estimates, OPR-style scoring, normalized phase values, confidence intervals, and reliability-adjusted rankings.</p>
      </div>
      <section className="grid gap-4 lg:grid-cols-2">
        <Card className="overflow-hidden">
          <div className="gold-rule" />
          <CardHeader><CardTitle>Phase Value By Team</CardTitle></CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics.slice(0, 8)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="teamNumber" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="autoScore" stackId="a" fill="#ffcc00" name="Auto" />
                <Bar dataKey="teleopScore" stackId="a" fill="#6b7280" name="Teleop" />
                <Bar dataKey="endgameScore" stackId="a" fill="#ffffff" name="Endgame" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="overflow-hidden">
          <div className="gold-rule" />
          <CardHeader><CardTitle>Scoring Trend</CardTitle></CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="match" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="score" stroke="#ffcc00" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </section>
      <Card>
        <CardHeader><CardTitle>Rankings</CardTitle></CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <thead><tr><Th>Team</Th><Th>EPA</Th><Th>OPR</Th><Th>Fuel Acc.</Th><Th>Cycles</Th><Th>Climb</Th><Th>Defense</Th><Th>Reliability</Th><Th>Confidence</Th></tr></thead>
            <tbody>
              {metrics.map((metric) => (
                <tr key={metric.teamNumber} className="border-t">
                  <Td><b>{metric.teamNumber}</b><div className="text-xs text-muted-foreground">{metric.teamName}</div></Td>
                  <Td>{metric.epaLikeRating}</Td>
                  <Td>{metric.oprEstimate}</Td>
                  <Td>{metric.fuelAccuracy}%</Td>
                  <Td>{metric.averageCycles}</Td>
                  <Td>{metric.climbSuccessRate}%</Td>
                  <Td>{metric.defensiveImpact}</Td>
                  <Td>{metric.reliability}%</Td>
                  <Td><Badge>{metric.confidence}% · {metric.confidenceInterval[0]}-{metric.confidenceInterval[1]}</Badge></Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
