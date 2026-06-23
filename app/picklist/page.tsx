"use client";

import { useMemo, useState } from "react";
import { Lock, Search, X } from "lucide-react";
import { ArchetypeBadge, ConfidenceBar, ModelExplanation, RiskBadge } from "@/components/analytics-widgets";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { PageHeading } from "@/components/page-heading";
import { event, matchEntries, teams } from "@/lib/sample-data";
import { calculateAdvancedTeamMetrics } from "@/lib/advanced-metrics";
import { allianceSynergyModel, defaultPickWeights, picklistValueModel } from "@/lib/models/picklistModel";

type PickWeightKey = keyof typeof defaultPickWeights;

export default function PicklistPage() {
  const metrics = useMemo(() => calculateAdvancedTeamMetrics(teams, matchEntries, event.gameConfig), []);
  const [weights, setWeights] = useState(defaultPickWeights);
  const [excluded, setExcluded] = useState<Record<number, string>>({});
  const [locked, setLocked] = useState<Record<number, "First pick" | "Second pick" | "Backup">>({});
  const [compareA, setCompareA] = useState(11);
  const [compareB, setCompareB] = useState(316);
  const [notes, setNotes] = useState("Before alliance selection, verify Tower timing and repair history for every top 24 team.");
  const scored = metrics
    .filter((team) => !excluded[team.teamNumber])
    .map((team) => ({ team, model: picklistValueModel(team, 75, weights) }))
    .sort((a, b) => b.model.prediction - a.model.prediction);
  const compareTeams = [compareA, compareB].map((teamNumber) => metrics.find((team) => team.teamNumber === teamNumber) ?? metrics[0]);
  const synergy = allianceSynergyModel(scored.slice(0, 3).map((item) => item.team.teamNumber), metrics);
  const gems = scored.filter((item) => item.team.pickValue > item.team.opr * 0.18).slice(0, 6);

  return (
    <div className="space-y-5">
      <PageHeading eyebrow="alliance selection 2.0" title="Picklist War Room" description="Risk-adjusted rankings, editable model weights, lockable tiers, team explanations, second-pick optimization, and alliance simulation." />
      <section className="grid gap-4 xl:grid-cols-[360px_1fr]">
        <Card className="overflow-hidden">
          <div className="gold-rule" />
          <CardHeader><CardTitle>Weighted Formula Editor</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {(Object.keys(weights) as PickWeightKey[]).map((key) => (
              <div key={key}>
                <div className="mb-1 flex justify-between text-xs"><Label>{key}</Label><span>{weights[key]}</span></div>
                <Input type="number" step="0.01" value={weights[key]} onChange={(event) => setWeights((current) => ({ ...current, [key]: Number(event.target.value) }))} />
              </div>
            ))}
            <div className="rounded-md bg-muted p-3 text-xs text-muted-foreground">PickValue = adjusted EPA + reliability + auto + climb + defense + consistency + synergy - risk penalty.</div>
            <Textarea value={notes} onChange={(event) => setNotes(event.target.value)} />
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <div className="gold-rule" />
          <CardHeader><CardTitle>Risk-Adjusted Ranking</CardTitle></CardHeader>
          <CardContent className="max-h-[760px] space-y-3 overflow-auto">
            {scored.map(({ team, model }, index) => (
              <div key={team.teamNumber} className="grid gap-3 rounded-md border border-primary/20 p-3 lg:grid-cols-[1fr_auto]">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-lg font-black">#{index + 1} · {team.teamNumber} {team.teamName}</span>
                    <ArchetypeBadge archetype={team.archetype} />
                    {locked[team.teamNumber] ? <span className="rounded-md bg-primary px-2 py-1 text-xs font-bold text-black"><Lock className="mr-1 inline h-3 w-3" />{locked[team.teamNumber]}</span> : null}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{model.explanation}</p>
                  <div className="mt-3 grid gap-2 sm:grid-cols-5">
                    <Mini label="Pick" value={model.prediction} />
                    <Mini label="Adj EPA" value={team.adjustedEpa} />
                    <Mini label="OPR" value={team.opr} />
                    <Mini label="Ceiling" value={team.ceiling} />
                    <Mini label="Risk" value={team.boomBustRisk} />
                  </div>
                </div>
                <div className="flex flex-wrap items-start gap-2 lg:flex-col">
                  <Select value={locked[team.teamNumber] ?? ""} onChange={(event) => setLocked((current) => ({ ...current, [team.teamNumber]: event.target.value as "First pick" | "Second pick" | "Backup" }))}>
                    <option value="">Tier</option>
                    <option>First pick</option>
                    <option>Second pick</option>
                    <option>Backup</option>
                  </Select>
                  <Button variant="outline" onClick={() => setExcluded((current) => ({ ...current, [team.teamNumber]: "Manual avoid / do-not-pick" }))}><X className="h-4 w-4" /> Avoid</Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <Card><CardHeader><CardTitle>Compare Two Teams</CardTitle></CardHeader><CardContent className="space-y-3"><div className="grid grid-cols-2 gap-2"><TeamSelect value={compareA} onChange={setCompareA} metrics={metrics} /><TeamSelect value={compareB} onChange={setCompareB} metrics={metrics} /></div>{compareTeams.map((team) => <CompareCard key={team.teamNumber} team={team} />)}</CardContent></Card>
        <ModelExplanation title="Why This Top Team?" output={scored[0].model} />
        <ModelExplanation title="Playoff Alliance Simulator" output={synergy} />
      </section>

      <section className="grid gap-4 xl:grid-cols-4">
        <TierBoard title="First Pick Tier" teams={scored.filter((item, index) => locked[item.team.teamNumber] === "First pick" || index < 8).map((item) => item.team).slice(0, 8)} />
        <TierBoard title="Second Pick Optimizer" teams={scored.filter((item) => item.team.reliabilityAdjustedEpa < 150 && item.team.breakdownRisk < 30).map((item) => item.team).slice(0, 8)} />
        <TierBoard title="Defense Bot Finder" teams={[...metrics].sort((a, b) => b.defenseImpact - a.defenseImpact).slice(0, 8)} />
        <TierBoard title="Underranked Gems" teams={gems.map((item) => item.team)} />
      </section>

      <Card>
        <CardHeader><CardTitle>Avoid List With Reasons</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {Object.entries(excluded).length ? Object.entries(excluded).map(([team, reason]) => <div className="flex items-center justify-between rounded-md border p-3 text-sm" key={team}><span>{team}: {reason}</span><Button size="sm" variant="outline" onClick={() => setExcluded((current) => { const next = { ...current }; delete next[Number(team)]; return next; })}>Remove</Button></div>) : <p className="text-sm text-muted-foreground">No teams excluded.</p>}
        </CardContent>
      </Card>
    </div>
  );
}

function TeamSelect({ value, onChange, metrics }: { value: number; onChange: (value: number) => void; metrics: ReturnType<typeof calculateAdvancedTeamMetrics> }) {
  return <Select value={value} onChange={(event) => onChange(Number(event.target.value))}>{metrics.map((team) => <option key={team.teamNumber} value={team.teamNumber}>{team.teamNumber}</option>)}</Select>;
}

function CompareCard({ team }: { team: ReturnType<typeof calculateAdvancedTeamMetrics>[number] }) {
  return <div className="rounded-md border p-3"><p className="font-black">{team.teamNumber} {team.teamName}</p><p className="text-xs text-muted-foreground">{team.archetype}</p><div className="mt-2"><ConfidenceBar value={team.confidence} /></div><p className="mt-2 text-sm">Pick {team.pickValue} · EPA {team.adjustedEpa} · <RiskBadge value={team.boomBustRisk} /></p></div>;
}

function TierBoard({ title, teams }: { title: string; teams: ReturnType<typeof calculateAdvancedTeamMetrics> }) {
  return <Card className="overflow-hidden"><div className="gold-rule" /><CardHeader><CardTitle className="flex items-center gap-2"><Search className="h-4 w-4 text-primary" /> {title}</CardTitle></CardHeader><CardContent className="space-y-2">{teams.map((team) => <div key={team.teamNumber} className="rounded-md border p-2 text-sm"><b>{team.teamNumber}</b> {team.teamName}<p className="text-xs text-muted-foreground">{team.archetype} · value {team.pickValue}</p></div>)}</CardContent></Card>;
}

function Mini({ label, value }: { label: string; value: number | string }) {
  return <div className="rounded-md bg-muted p-2 text-center"><p className="text-xs text-muted-foreground">{label}</p><p className="font-black text-primary">{value}</p></div>;
}
