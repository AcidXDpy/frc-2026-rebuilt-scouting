"use client";

import Link from "next/link";
import { Activity, AlertTriangle, ArrowRight, ClipboardList, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/stat-card";
import { event, matches, teams } from "@/lib/sample-data";
import { calculateTeamMetrics, detectQualityIssues, predictMatch } from "@/lib/stats";
import { matchEntries } from "@/lib/sample-data";

export default function DashboardPage() {
  const metrics = calculateTeamMetrics(teams, matchEntries, event.gameConfig);
  const top = metrics[0];
  const nextMatch = matches.find((match) => !match.redScore);
  const prediction = nextMatch ? predictMatch(nextMatch.red, nextMatch.blue, metrics, event.gameConfig) : null;
  const issues = detectQualityIssues(matchEntries, metrics);

  return (
    <div className="space-y-5">
      <section className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
        <div className="rounded-lg border bg-card p-5">
          <p className="text-sm font-medium text-primary">{event.name}</p>
          <h1 className="mt-2 text-3xl font-bold tracking-normal sm:text-4xl">Competition scouting for {event.gameConfig.gameName}</h1>
          <p className="mt-3 max-w-3xl text-muted-foreground">
            Fast mobile collection, configurable scoring, local offline queueing, analytics, picklists, and match strategy in one workflow for a high school strategy team.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Button asChild><Link href="/scout"><ClipboardList className="h-4 w-4" /> Start scouting</Link></Button>
            <Button asChild variant="outline"><Link href="/analytics">Open analytics <ArrowRight className="h-4 w-4" /></Link></Button>
          </div>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Next Match</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {nextMatch && prediction ? (
              <>
                <div className="flex items-center justify-between rounded-md bg-muted p-3">
                  <span className="font-medium">QM {nextMatch.number}</span>
                  <span className="text-sm text-muted-foreground">{new Date(nextMatch.time).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="rounded-md border p-3"><p className="text-muted-foreground">Red</p><p className="font-semibold">{nextMatch.red.join(", ")}</p></div>
                  <div className="rounded-md border p-3"><p className="text-muted-foreground">Blue</p><p className="font-semibold">{nextMatch.blue.join(", ")}</p></div>
                </div>
                <p className="text-sm">Prediction: <b>{prediction.allianceScore}</b> to <b>{prediction.opponentScore}</b>, {prediction.winProbability}% red win probability.</p>
              </>
            ) : <p className="text-sm text-muted-foreground">All sample matches have scores.</p>}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Teams Loaded" value={teams.length} detail="event team database" />
        <StatCard label="Scout Entries" value={matchEntries.length} detail="offline-capable records" />
        <StatCard label="Top EPA-like" value={`${top.teamNumber} · ${top.epaLikeRating}`} detail={top.teamName} />
        <StatCard label="Quality Flags" value={issues.impossible.length + issues.suspicious.length} detail="review before picklist" />
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="flex items-center gap-2"><Trophy className="h-5 w-5 text-secondary" /> Team Power Board</CardTitle></CardHeader>
          <CardContent className="grid gap-2 sm:grid-cols-2">
            {metrics.slice(0, 6).map((metric, index) => (
              <Link href={`/teams?team=${metric.teamNumber}`} key={metric.teamNumber} className="rounded-md border p-3 transition hover:bg-muted">
                <div className="flex items-center justify-between">
                  <span className="font-semibold">#{index + 1} · {metric.teamNumber}</span>
                  <span className="text-sm text-primary">{metric.epaLikeRating}</span>
                </div>
                <p className="text-sm text-muted-foreground">{metric.teamName}</p>
                <p className="mt-2 text-xs text-muted-foreground">Auto {metric.autoScore} · Tele {metric.teleopScore} · Climb {metric.climbSuccessRate}%</p>
              </Link>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-destructive" /> Live Risks</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            {issues.suspicious.slice(0, 5).map((metric) => (
              <div key={metric.teamNumber} className="rounded-md border p-3">
                <p className="font-medium">{metric.teamNumber} {metric.teamName}</p>
                <p className="text-muted-foreground">Confidence {metric.confidence}% · disabled rate {metric.disabledRate}%</p>
              </div>
            ))}
            {!issues.suspicious.length ? <p className="text-muted-foreground">No suspicious entries in the current sample.</p> : null}
            <Button asChild variant="outline" className="w-full"><Link href="/quality"><Activity className="h-4 w-4" /> Review data quality</Link></Button>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
