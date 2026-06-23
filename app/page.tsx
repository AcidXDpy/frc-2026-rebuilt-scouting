"use client";

import Link from "next/link";
import Image from "next/image";
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
      <section className="grid gap-4 lg:grid-cols-[1.7fr_1fr]">
        <div className="relative overflow-hidden rounded-lg border border-primary/30 bg-[#050505] p-5 text-white shadow-[0_24px_70px_rgba(0,0,0,0.35)]">
          <div className="absolute inset-y-0 right-0 hidden w-2/5 bg-[linear-gradient(90deg,transparent,rgba(255,204,0,0.13))] lg:block" />
          <div className="relative z-10">
          <Image src="/team-logo.png" alt="M.O.R.T. team logo" width={426} height={97} priority className="mb-6 h-12 w-auto max-w-full object-contain sm:h-16" />
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-primary">{event.name}</p>
          <h1 className="mt-2 max-w-3xl text-3xl font-black tracking-normal sm:text-5xl">REBUILT match intelligence, tuned for M.O.R.T.</h1>
          <p className="mt-3 max-w-3xl text-zinc-300">
            Fast mobile collection, configurable scoring, local offline queueing, analytics, picklists, and match strategy in one workflow for a high school strategy team.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Button asChild><Link href="/scout"><ClipboardList className="h-4 w-4" /> Start scouting</Link></Button>
            <Button asChild variant="outline" className="border-primary/40 bg-black/50 text-primary hover:bg-primary hover:text-black"><Link href="/analytics">Open analytics <ArrowRight className="h-4 w-4" /></Link></Button>
          </div>
          </div>
        </div>
        <Card className="overflow-hidden border-primary/25">
          <div className="gold-rule" />
          <CardHeader>
            <CardTitle>Next Match</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {nextMatch && prediction ? (
              <>
                <div className="flex items-center justify-between rounded-md bg-primary p-3 text-primary-foreground">
                  <span className="font-black">QM {nextMatch.number}</span>
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
          <CardHeader><CardTitle className="flex items-center gap-2"><Trophy className="h-5 w-5 text-primary" /> Team Power Board</CardTitle></CardHeader>
          <CardContent className="grid gap-2 sm:grid-cols-2">
            {metrics.slice(0, 6).map((metric, index) => (
              <Link href={`/teams?team=${metric.teamNumber}`} key={metric.teamNumber} className="rounded-md border border-primary/15 p-3 transition hover:border-primary/45 hover:bg-primary/10">
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
