"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, Td, Th } from "@/components/ui/table";
import { PageHeading } from "@/components/page-heading";
import { event, matchEntries, teams } from "@/lib/sample-data";
import { calculateTeamMetrics, detectQualityIssues } from "@/lib/stats";

export default function QualityPage() {
  const metrics = calculateTeamMetrics(teams, matchEntries, event.gameConfig);
  const issues = detectQualityIssues(matchEntries, metrics);

  return (
    <div className="space-y-5">
      <PageHeading eyebrow="trust the data" title="Data Quality Review" description="Scout agreement checks, impossible values, outliers, missing data, and confidence scoring." />
      <section className="grid gap-4 md:grid-cols-4">
        <Summary title="Duplicates" value={issues.duplicated.length} />
        <Summary title="Impossible" value={issues.impossible.length} />
        <Summary title="Suspicious" value={issues.suspicious.length} />
        <Summary title="Missing Teams" value={issues.missingTeams.length} />
      </section>
      <Card>
        <CardHeader><CardTitle>Suspicious Metrics</CardTitle></CardHeader>
        <CardContent className="overflow-x-auto">
          <Table><thead><tr><Th>Team</Th><Th>Reason</Th><Th>Confidence</Th><Th>Reliability</Th><Th>Accuracy</Th></tr></thead><tbody>{issues.suspicious.map((metric) => <tr className="border-t" key={metric.teamNumber}><Td>{metric.teamNumber} {metric.teamName}</Td><Td>{metric.confidence < 45 ? "Low sample confidence" : metric.disabledRate > 20 ? "High reliability risk" : "Accuracy outlier"}</Td><Td>{metric.confidence}%</Td><Td>{metric.reliability}%</Td><Td>{metric.fuelAccuracy}%</Td></tr>)}</tbody></Table>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Scout Agreement</CardTitle></CardHeader>
        <CardContent className="space-y-2 text-sm">
          {matchEntries.slice(0, 8).map((entry) => <div className="rounded-md border p-3" key={entry.id}>QM{entry.matchNumber} · {entry.teamNumber}: {entry.scoutName} reported {entry.autoFuelMade + entry.teleFuelMade} fuel makes, defense {entry.defenseRating}/5, notes {entry.quickNotes.join(", ")}</div>)}
        </CardContent>
      </Card>
    </div>
  );
}

function Summary({ title, value }: { title: string; value: number }) {
  return <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">{title}</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{value}</p></CardContent></Card>;
}
