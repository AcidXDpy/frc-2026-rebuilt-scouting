"use client";

import { AlertTriangle, ShieldCheck } from "lucide-react";
import { ConfidenceBar, RiskBadge } from "@/components/analytics-widgets";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, Td, Th } from "@/components/ui/table";
import { PageHeading } from "@/components/page-heading";
import { event, matchEntries, pitEntries, teams } from "@/lib/sample-data";
import { calculateAdvancedTeamMetrics } from "@/lib/advanced-metrics";
import { calculateTeamMetrics, detectQualityIssues, standardDeviation } from "@/lib/stats";

export default function QualityPage() {
  const basicMetrics = calculateTeamMetrics(teams, matchEntries, event.gameConfig);
  const advanced = calculateAdvancedTeamMetrics(teams, matchEntries, event.gameConfig);
  const issues = detectQualityIssues(matchEntries, basicMetrics);
  const scoutTrust = calculateScoutTrust();
  const lowConfidence = advanced.filter((team) => team.confidence < 72 || team.boomBustRisk > 60).slice(0, 16);
  const stalePit = pitEntries.filter((entry) => entry.repairNotes.includes("No event-specific")).slice(0, 12);
  const coverage = Math.round(matchEntries.length / (teams.length * 3) * 100);

  return (
    <div className="space-y-5">
      <PageHeading eyebrow="trust the data" title="Data Quality Command" description="Scout trust, match coverage, outlier detection, stale pit data, low confidence teams, and review queues." />
      <section className="grid gap-4 md:grid-cols-4">
        <Summary title="Match Coverage" value={`${coverage}%`} />
        <Summary title="Scout Disagreement" value={issues.suspicious.length} />
        <Summary title="Impossible Values" value={issues.impossible.length} />
        <Summary title="Stale Pit Notes" value={stalePit.length} />
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <Card className="overflow-hidden">
          <div className="gold-rule" />
          <CardHeader><CardTitle className="flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-primary" /> Scout Trust Scores</CardTitle></CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <thead><tr><Th>Scout</Th><Th>Trust</Th><Th>Completion</Th><Th>Agreement</Th><Th>Outlier Rate</Th><Th>Notes</Th></tr></thead>
              <tbody>{scoutTrust.map((scout) => <tr key={scout.name} className="border-t"><Td><b>{scout.name}</b></Td><Td><div className="min-w-28"><ConfidenceBar value={scout.trust} /></div></Td><Td>{scout.completion}%</Td><Td>{scout.agreement}%</Td><Td>{scout.outlierRate}%</Td><Td>{scout.notesQuality}%</Td></tr>)}</tbody>
            </Table>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-red-500/25">
          <div className="gold-rule" />
          <CardHeader><CardTitle className="flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-red-400" /> Entries Needing Review</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {reviewQueue().slice(0, 12).map((entry) => <div key={entry.id} className="rounded-md border p-3 text-sm"><b>QM{entry.matchNumber} · {entry.teamNumber}</b><p className="text-muted-foreground">{entry.reason}</p></div>)}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <Card><CardHeader><CardTitle>Teams With Low Confidence</CardTitle></CardHeader><CardContent className="space-y-2">{lowConfidence.map((team) => <div key={team.teamNumber} className="rounded-md border p-3 text-sm"><div className="flex justify-between"><b>{team.teamNumber} {team.teamName}</b><RiskBadge value={team.boomBustRisk} /></div><p className="text-xs text-muted-foreground">Confidence {team.confidence}% · scout agreement {team.scoutAgreement}%</p><ConfidenceBar value={team.confidence} /></div>)}</CardContent></Card>
        <Card><CardHeader><CardTitle>Missing / Thin Data</CardTitle></CardHeader><CardContent className="space-y-2">{advanced.filter((team) => team.confidence < 60).slice(0, 12).map((team) => <p className="rounded-md border p-3 text-sm" key={team.teamNumber}>{team.teamNumber}: add more match samples before trusting pick value.</p>)}</CardContent></Card>
        <Card><CardHeader><CardTitle>Stale Pit Data</CardTitle></CardHeader><CardContent className="space-y-2">{stalePit.map((entry) => <p key={entry.id} className="rounded-md border p-3 text-sm">{entry.teamNumber}: pit notes are still imported placeholders.</p>)}</CardContent></Card>
      </section>

      <Card>
        <CardHeader><CardTitle>Outlier / Impossible Checks</CardTitle></CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <thead><tr><Th>Category</Th><Th>Count</Th><Th>Action</Th></tr></thead>
            <tbody>
              <tr className="border-t"><Td>Missing team entries</Td><Td>{issues.missingTeams.length}</Td><Td>Assign scouts or import schedule coverage.</Td></tr>
              <tr className="border-t"><Td>Impossible values</Td><Td>{issues.impossible.length}</Td><Td>Fix makes-over-attempts or impossible cycle times.</Td></tr>
              <tr className="border-t"><Td>Duplicate robot entries</Td><Td>{issues.duplicated.length}</Td><Td>Merge consensus or mark one as rejected.</Td></tr>
              <tr className="border-t"><Td>Suspicious metrics</Td><Td>{issues.suspicious.length}</Td><Td>Review high accuracy, low confidence, or reliability flags.</Td></tr>
            </tbody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );

  function reviewQueue() {
    return matchEntries
      .map((entry) => {
        const fuel = entry.autoFuelMade + entry.teleFuelMade;
        const attempts = entry.autoFuelAttempted + entry.teleFuelAttempted;
        const reason = entry.autoFuelMade > entry.autoFuelAttempted || entry.teleFuelMade > entry.teleFuelAttempted
          ? "Impossible make/attempt count."
          : entry.fouls + entry.penalties > 1
            ? "Multiple fouls/penalties; verify with match video."
            : attempts > 0 && fuel / attempts > 0.9
              ? "Very high fuel accuracy; confirm scout count."
              : entry.breakdowns
                ? "Breakdown note requires strategy review."
                : "";
        return { ...entry, reason };
      })
      .filter((entry) => entry.reason);
  }

  function calculateScoutTrust() {
    const scouts = Array.from(new Set(matchEntries.map((entry) => entry.scoutName)));
    return scouts.map((name) => {
      const entries = matchEntries.filter((entry) => entry.scoutName === name);
      const totals = entries.map((entry) => entry.autoFuelMade + entry.teleFuelMade + entry.defenseRating * 2);
      const agreement = Math.max(20, Math.min(100, 100 - standardDeviation(totals) * 2.6));
      const completion = Math.round(entries.length / Math.max(...scouts.map((scout) => matchEntries.filter((entry) => entry.scoutName === scout).length)) * 100);
      const outlierRate = Math.round(entries.filter((entry) => entry.fouls + entry.penalties > 1 || entry.autoFuelMade > entry.autoFuelAttempted || entry.teleFuelMade > entry.teleFuelAttempted).length / entries.length * 100);
      const notesQuality = Math.round(entries.filter((entry) => entry.notes || entry.quickNotes.length).length / entries.length * 100);
      const trust = Math.round(agreement * 0.36 + completion * 0.28 + (100 - outlierRate) * 0.2 + notesQuality * 0.16);
      return { name, trust, completion, agreement: Math.round(agreement), outlierRate, notesQuality };
    }).sort((a, b) => b.trust - a.trust);
  }
}

function Summary({ title, value }: { title: string; value: string | number }) {
  return <Card className="overflow-hidden"><div className="gold-rule" /><CardHeader className="pb-2"><CardTitle className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{title}</CardTitle></CardHeader><CardContent><p className="text-3xl font-black text-primary">{value}</p></CardContent></Card>;
}
