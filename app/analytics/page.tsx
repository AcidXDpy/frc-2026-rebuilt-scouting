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
      <div>
        <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
        <p className="text-sm text-muted-foreground">EPA-like estimates, OPR-style scoring, normalized phase values, confidence intervals, and reliability-adjusted rankings.</p>
      </div>
      <section className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Phase Value By Team</CardTitle></CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics.slice(0, 8)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="teamNumber" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="autoScore" stackId="a" fill="#0891b2" name="Auto" />
                <Bar dataKey="teleopScore" stackId="a" fill="#16a34a" name="Teleop" />
                <Bar dataKey="endgameScore" stackId="a" fill="#f59e0b" name="Endgame" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Scoring Trend</CardTitle></CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="match" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="score" stroke="#0891b2" strokeWidth={2} />
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
