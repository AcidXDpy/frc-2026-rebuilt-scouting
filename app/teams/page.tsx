"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PageHeading } from "@/components/page-heading";
import { event, matchEntries, pitEntries, teams } from "@/lib/sample-data";
import { calculateTeamMetrics } from "@/lib/stats";

export default function TeamsPage() {
  const [query, setQuery] = useState("");
  const metrics = calculateTeamMetrics(teams, matchEntries, event.gameConfig);
  const filtered = useMemo(() => teams.filter((team) => `${team.number} ${team.name}`.toLowerCase().includes(query.toLowerCase())), [query]);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <PageHeading className="flex-1" eyebrow="event intel" title="Team Database" description="Profiles, pit notes, match history, photos, strengths, weaknesses, and strategy notes." />
        <Input className="sm:max-w-xs" placeholder="Search team..." value={query} onChange={(event) => setQuery(event.target.value)} />
      </div>
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((team) => {
          const metric = metrics.find((candidate) => candidate.teamNumber === team.number);
          const pit = pitEntries.find((entry) => entry.teamNumber === team.number);
          const history = matchEntries.filter((entry) => entry.teamNumber === team.number);
          return (
            <Card key={team.number}>
              <CardHeader>
                <CardTitle>{team.number} · {team.name}</CardTitle>
                <p className="text-sm text-muted-foreground">{team.city}, {team.state}</p>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-wrap gap-2">{pit?.archetypes.map((tag) => <Badge key={tag}>{tag}</Badge>)}</div>
                <div className="grid grid-cols-3 gap-2 text-center text-sm">
                  <div className="rounded-md bg-muted p-2"><b>{metric?.epaLikeRating ?? 0}</b><p className="text-xs text-muted-foreground">EPA</p></div>
                  <div className="rounded-md bg-muted p-2"><b>{metric?.fuelAccuracy ?? 0}%</b><p className="text-xs text-muted-foreground">Fuel</p></div>
                  <div className="rounded-md bg-muted p-2"><b>{metric?.climbSuccessRate ?? 0}%</b><p className="text-xs text-muted-foreground">Climb</p></div>
                </div>
                <div className="text-sm"><b>Strengths:</b> {team.strengths.join(", ")}</div>
                <div className="text-sm"><b>Weaknesses:</b> {team.weaknesses.join(", ")}</div>
                <div className="rounded-md border p-3 text-sm text-muted-foreground">{team.strategyNotes}</div>
                <p className="text-xs text-muted-foreground">Match history: {history.map((entry) => `QM${entry.matchNumber}`).join(", ") || "No entries yet"}</p>
              </CardContent>
            </Card>
          );
        })}
      </section>
    </div>
  );
}
