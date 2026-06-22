"use client";

import { useEffect, useMemo, useState } from "react";
import { GripVertical, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { event, matchEntries, teams } from "@/lib/sample-data";
import { calculateTeamMetrics, weightedPickScore } from "@/lib/stats";
import type { PickWeights } from "@/lib/types";

export default function PicklistPage() {
  const [weights, setWeights] = useState<PickWeights>({ scoringWeight: 1.1, climbWeight: 0.9, reliabilityWeight: 0.55, defenseWeight: 0.4, consistencyWeight: 0.5, autoWeight: 0.7 });
  const [excluded, setExcluded] = useState<number[]>([2767]);
  const [manualOrder, setManualOrder] = useState<number[]>([]);
  const [notes, setNotes] = useState("Confirm spare parts and climb timing before final lock.");
  const metrics = useMemo(() => calculateTeamMetrics(teams, matchEntries, event.gameConfig), []);
  const scored = useMemo(() => metrics.map((metric) => ({ ...metric, pickScore: weightedPickScore(metric, weights) })).filter((metric) => !excluded.includes(metric.teamNumber)).sort((a, b) => b.pickScore - a.pickScore), [metrics, weights, excluded]);
  const ranked = useMemo(() => {
    if (!manualOrder.length) return scored;
    return [...scored].sort((a, b) => {
      const ai = manualOrder.indexOf(a.teamNumber);
      const bi = manualOrder.indexOf(b.teamNumber);
      return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
    });
  }, [manualOrder, scored]);

  useEffect(() => {
    setManualOrder(scored.map((metric) => metric.teamNumber));
  }, [scored]);

  function move(index: number, delta: number) {
    const next = [...ranked];
    const target = index + delta;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    setManualOrder(next.map((metric) => metric.teamNumber));
  }

  return (
    <div className="space-y-5">
      <div><h1 className="text-2xl font-bold">Picklist Builder</h1><p className="text-sm text-muted-foreground">Weighted formula, filters, do-not-pick list, tiers, and alliance selection notes.</p></div>
      <section className="grid gap-4 lg:grid-cols-[360px_1fr]">
        <Card>
          <CardHeader><CardTitle>Formula Weights</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {(Object.keys(weights) as (keyof PickWeights)[]).map((key) => (
              <div key={key}>
                <Label>{key}</Label>
                <Input type="number" step="0.05" value={weights[key]} onChange={(event) => setWeights((current) => ({ ...current, [key]: Number(event.target.value) }))} />
              </div>
            ))}
            <Textarea value={notes} onChange={(event) => setNotes(event.target.value)} />
            <div className="rounded-md bg-muted p-3 text-xs text-muted-foreground">
              total = scoringWeight * scoring + climbWeight * climb + reliabilityWeight * reliability + defenseWeight * defense + consistencyWeight * consistency + autoWeight * auto
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Ranked Board</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {ranked.map((metric, index) => (
              <div key={metric.teamNumber} className="grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-md border p-3">
                <GripVertical className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-semibold">#{index + 1} · {metric.teamNumber} {metric.teamName}</p>
                  <p className="text-xs text-muted-foreground">Score {metric.pickScore} · EPA {metric.epaLikeRating} · climb {metric.climbSuccessRate}% · reliability {metric.reliability}%</p>
                  <p className="mt-1 text-xs font-medium">{index < 3 ? "First pick tier" : index < 6 ? "Second pick tier" : "Backup tier"}</p>
                </div>
                <div className="flex gap-1">
                  <Button size="sm" variant="outline" onClick={() => move(index, -1)}>Up</Button>
                  <Button size="sm" variant="outline" onClick={() => move(index, 1)}>Down</Button>
                  <Button size="icon" variant="ghost" onClick={() => setExcluded((current) => [...current, metric.teamNumber])}><X className="h-4 w-4" /></Button>
                </div>
              </div>
            ))}
            <div className="rounded-md border p-3 text-sm"><b>Excluded:</b> {excluded.join(", ")} <Button className="ml-2" size="sm" variant="outline" onClick={() => setExcluded([])}>Clear</Button></div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
