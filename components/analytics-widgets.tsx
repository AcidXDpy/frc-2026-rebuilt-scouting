import type React from "react";
import { AlertTriangle, Brain, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ModelOutput, TeamAdvancedMetrics } from "@/lib/types";

export function ConfidenceBar({ value }: { value: number }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
      <div className="h-full rounded-full bg-primary shadow-[0_0_16px_rgba(255,204,0,0.55)]" style={{ width: `${Math.max(4, Math.min(100, value))}%` }} />
    </div>
  );
}

export function RiskBadge({ value }: { value: number }) {
  const tone = value > 70 ? "border-red-500/40 bg-red-500/15 text-red-200" : value > 40 ? "border-yellow-500/40 bg-yellow-500/15 text-yellow-100" : "border-emerald-500/40 bg-emerald-500/15 text-emerald-100";
  return <span className={`inline-flex rounded-md border px-2 py-1 text-xs font-bold ${tone}`}>Risk {Math.round(value)}</span>;
}

export function ArchetypeBadge({ archetype }: { archetype: TeamAdvancedMetrics["archetype"] }) {
  return <Badge className="border-primary/40 bg-primary/15 text-primary">{archetype}</Badge>;
}

export function TeamBadge({ team }: { team: TeamAdvancedMetrics }) {
  return (
    <div className="rounded-md border border-primary/20 bg-black/20 p-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-black">{team.teamNumber} {team.teamName}</p>
          <p className="text-xs text-muted-foreground">{team.archetype}</p>
        </div>
        <span className="text-lg font-black text-primary">{team.reliabilityAdjustedEpa}</span>
      </div>
      <div className="mt-3"><ConfidenceBar value={team.confidence} /></div>
    </div>
  );
}

export function ModelExplanation<T>({ title, output }: { title: string; output: ModelOutput<T> }) {
  return (
    <Card className="overflow-hidden">
      <div className="gold-rule" />
      <CardHeader><CardTitle className="flex items-center gap-2"><Brain className="h-5 w-5 text-primary" /> {title}</CardTitle></CardHeader>
      <CardContent className="space-y-3 text-sm">
        <p className="text-muted-foreground">{output.explanation}</p>
        <div><p className="mb-1 text-xs font-bold uppercase tracking-[0.18em] text-primary">Positive factors</p><div className="flex flex-wrap gap-2">{output.topPositiveFactors.map((factor) => <Badge key={factor.label}>{factor.label}: {factor.value}</Badge>)}</div></div>
        <div><p className="mb-1 text-xs font-bold uppercase tracking-[0.18em] text-destructive">Negative factors</p><div className="flex flex-wrap gap-2">{output.topNegativeFactors.map((factor) => <Badge key={factor.label}>{factor.label}: {factor.value}</Badge>)}</div></div>
        <div><p className="mb-1 text-xs text-muted-foreground">Model confidence {output.confidence}%</p><ConfidenceBar value={output.confidence} /></div>
      </CardContent>
    </Card>
  );
}

export function PredictionMeter({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-primary/20 bg-black/20 p-4">
      <div className="flex items-center justify-between text-sm"><span>{label}</span><b className="text-primary">{Math.round(value)}%</b></div>
      <div className="mt-3"><ConfidenceBar value={value} /></div>
    </div>
  );
}

export function StrategyRecommendationCard({ title, items, danger }: { title: string; items: string[]; danger?: boolean }) {
  return (
    <Card className={danger ? "border-red-500/30" : ""}>
      <CardHeader><CardTitle className="flex items-center gap-2">{danger ? <AlertTriangle className="h-5 w-5 text-red-400" /> : <ShieldCheck className="h-5 w-5 text-primary" />} {title}</CardTitle></CardHeader>
      <CardContent className="space-y-2">{items.map((item) => <p className="rounded-md border p-3 text-sm" key={item}>{item}</p>)}</CardContent>
    </Card>
  );
}

export function TeamCompareDrawer({ teams }: { teams: TeamAdvancedMetrics[] }) {
  return (
    <Card>
      <CardHeader><CardTitle>Team Compare</CardTitle></CardHeader>
      <CardContent className="grid gap-3 md:grid-cols-2">
        {teams.map((team) => <TeamBadge key={team.teamNumber} team={team} />)}
      </CardContent>
    </Card>
  );
}

export function SynergyBreakdown({ values }: { values: { label: string; value: number }[] }) {
  return (
    <div className="space-y-2">
      {values.map((item) => (
        <div key={item.label}>
          <div className="mb-1 flex justify-between text-xs"><span>{item.label}</span><b>{Math.round(item.value)}%</b></div>
          <ConfidenceBar value={item.value} />
        </div>
      ))}
    </div>
  );
}

export function PicklistTierBoard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card className="overflow-hidden">
      <div className="gold-rule" />
      <CardHeader><CardTitle>{title}</CardTitle></CardHeader>
      <CardContent className="space-y-2">{children}</CardContent>
    </Card>
  );
}
