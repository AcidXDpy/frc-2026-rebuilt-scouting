"use client";

import { useEffect, useMemo, useState } from "react";
import { Minus, Plus, Save, TimerReset } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { event, matches } from "@/lib/sample-data";
import { getMatchEntries, getQueuedSyncCount, saveMatchEntry } from "@/lib/offline-store";
import type { MatchScoutEntry } from "@/lib/types";

const blank = (teamNumber: number, matchNumber: number, alliance: "red" | "blue"): MatchScoutEntry => ({
  id: `local-${matchNumber}-${teamNumber}-${Date.now()}`,
  eventId: event.id,
  matchId: `qm${matchNumber}`,
  matchNumber,
  teamNumber,
  alliance,
  station: `${alliance.toUpperCase()} 1`,
  scoutName: "",
  autoFuelMade: 0,
  autoFuelAttempted: 0,
  teleFuelMade: 0,
  teleFuelAttempted: 0,
  intakeSource: "Ground",
  cycleTimes: [],
  towerClimbLevel: "None",
  climbSuccess: false,
  defenseRating: 0,
  driverSkill: 3,
  penalties: 0,
  fouls: 0,
  disabled: false,
  tipped: false,
  connectionIssues: false,
  breakdowns: "",
  quickNotes: [],
  notes: "",
  createdAt: new Date().toISOString(),
  synced: false
});

export default function ScoutPage() {
  const [matchNumber, setMatchNumber] = useState(4);
  const selectedMatch = matches.find((match) => match.number === matchNumber) ?? matches[0];
  const [teamNumber, setTeamNumber] = useState(selectedMatch.red[0]);
  const alliance = selectedMatch.red.includes(teamNumber) ? "red" : "blue";
  const [entry, setEntry] = useState<MatchScoutEntry>(() => blank(teamNumber, matchNumber, alliance));
  const [cycleStart, setCycleStart] = useState<number | null>(null);
  const [queued, setQueued] = useState(0);
  const attempts = entry.autoFuelAttempted + entry.teleFuelAttempted;

  useEffect(() => {
    setEntry(blank(teamNumber, matchNumber, alliance));
  }, [teamNumber, matchNumber, alliance]);

  useEffect(() => {
    void getQueuedSyncCount().then(setQueued);
  }, []);

  const validation = useMemo(() => {
    const errors = [];
    if (entry.autoFuelMade > entry.autoFuelAttempted) errors.push("Auto makes cannot exceed attempts.");
    if (entry.teleFuelMade > entry.teleFuelAttempted) errors.push("Teleop makes cannot exceed attempts.");
    if (attempts > event.gameConfig.validations.maxFuelAttemptsPerMatch) errors.push("Fuel attempts exceed configured maximum.");
    if (entry.climbSuccess && entry.towerClimbLevel === "None") errors.push("A successful climb needs a Tower level.");
    return errors;
  }, [attempts, entry]);

  const set = <K extends keyof MatchScoutEntry>(key: K, value: MatchScoutEntry[K]) => setEntry((current) => ({ ...current, [key]: value }));
  const counter = (key: "autoFuelMade" | "autoFuelAttempted" | "teleFuelMade" | "teleFuelAttempted" | "penalties" | "fouls", delta: number) => set(key, Math.max(0, Number(entry[key]) + delta) as MatchScoutEntry[typeof key]);

  function recordCycle() {
    if (!cycleStart) {
      setCycleStart(Date.now());
      return;
    }
    const seconds = Math.round((Date.now() - cycleStart) / 1000);
    if (seconds >= event.gameConfig.validations.minCycleSeconds && seconds <= event.gameConfig.validations.maxCycleSeconds) {
      set("cycleTimes", [...entry.cycleTimes, seconds]);
    }
    setCycleStart(null);
  }

  function save() {
    if (validation.length) return;
    saveMatchEntry({ ...entry, createdAt: new Date().toISOString(), synced: false });
    void getQueuedSyncCount().then(setQueued);
    alert("Saved locally and queued for sync.");
  }

  return (
    <div className="space-y-4">
      <div><h1 className="text-2xl font-bold">Match Scouting</h1><p className="text-sm text-muted-foreground">Offline-first mobile form. Queue: {queued} unsynced record(s).</p></div>
      <Card>
        <CardContent className="grid gap-3 pt-4 sm:grid-cols-4">
          <div><Label>Match</Label><Select value={String(matchNumber)} onChange={(e) => setMatchNumber(Number(e.target.value))}>{matches.map((match) => <option key={match.id} value={match.number}>QM {match.number}</option>)}</Select></div>
          <div><Label>Robot</Label><Select value={String(teamNumber)} onChange={(e) => setTeamNumber(Number(e.target.value))}>{[...selectedMatch.red, ...selectedMatch.blue].map((team) => <option key={team} value={team}>{team}</option>)}</Select></div>
          <div><Label>Station</Label><Input value={entry.station} onChange={(e) => set("station", e.target.value)} /></div>
          <div><Label>Scout</Label><Input value={entry.scoutName} onChange={(e) => set("scoutName", e.target.value)} placeholder="Your name" /></div>
        </CardContent>
      </Card>
      <section className="grid gap-4 lg:grid-cols-3">
        <CounterCard title="Auto Fuel" made={entry.autoFuelMade} attempted={entry.autoFuelAttempted} onMade={(d) => counter("autoFuelMade", d)} onAttempt={(d) => counter("autoFuelAttempted", d)} />
        <CounterCard title="Teleop Fuel" made={entry.teleFuelMade} attempted={entry.teleFuelAttempted} onMade={(d) => counter("teleFuelMade", d)} onAttempt={(d) => counter("teleFuelAttempted", d)} />
        <Card>
          <CardHeader><CardTitle>Cycle Timer</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full" variant={cycleStart ? "secondary" : "default"} onClick={recordCycle}><TimerReset className="h-4 w-4" /> {cycleStart ? "Finish cycle" : "Start cycle"}</Button>
            <div className="flex flex-wrap gap-2">{entry.cycleTimes.map((time, index) => <span className="rounded-md bg-muted px-2 py-1 text-sm" key={index}>{time}s</span>)}</div>
            <Button variant="outline" className="w-full" onClick={() => set("cycleTimes", entry.cycleTimes.slice(0, -1))}>Undo last cycle</Button>
          </CardContent>
        </Card>
      </section>
      <Card>
        <CardHeader><CardTitle>Endgame, Defense, Issues</CardTitle></CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div><Label>Intake Source</Label><Select value={entry.intakeSource} onChange={(e) => set("intakeSource", e.target.value)}>{event.gameConfig.intakeSources.map((source) => <option key={source}>{source}</option>)}</Select></div>
          <div><Label>Tower Climb</Label><Select value={entry.towerClimbLevel} onChange={(e) => set("towerClimbLevel", e.target.value)}>{event.gameConfig.scoringFields.climb.levels.map((level) => <option key={level}>{level}</option>)}</Select></div>
          <label className="flex items-center gap-2 rounded-md border p-3"><input type="checkbox" checked={entry.climbSuccess} onChange={(e) => set("climbSuccess", e.target.checked)} /> Climb success</label>
          <Slider label="Defense rating" value={entry.defenseRating} max={5} onChange={(value) => set("defenseRating", value)} />
          <Slider label="Driver skill" value={entry.driverSkill} max={5} onChange={(value) => set("driverSkill", value)} />
          <div className="grid grid-cols-2 gap-2"><SmallCounter label="Fouls" value={entry.fouls} onChange={(d) => counter("fouls", d)} /><SmallCounter label="Penalties" value={entry.penalties} onChange={(d) => counter("penalties", d)} /></div>
          {(["disabled", "tipped", "connectionIssues"] as const).map((flag) => <label key={flag} className="flex items-center gap-2 rounded-md border p-3"><input type="checkbox" checked={Boolean(entry[flag])} onChange={(e) => set(flag, e.target.checked)} /> {flag}</label>)}
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Quick Notes</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-2">{event.gameConfig.quickNotes.map((note) => <Button key={note} size="sm" variant={entry.quickNotes.includes(note) ? "secondary" : "outline"} onClick={() => set("quickNotes", entry.quickNotes.includes(note) ? entry.quickNotes.filter((item) => item !== note) : [...entry.quickNotes, note])}>{note}</Button>)}</div>
          <Textarea placeholder="Breakdowns, defensive context, driver notes..." value={entry.notes} onChange={(e) => set("notes", e.target.value)} />
          {validation.map((error) => <p className="text-sm text-destructive" key={error}>{error}</p>)}
          <Button className="w-full" size="lg" disabled={validation.length > 0} onClick={save}><Save className="h-4 w-4" /> Save scouting entry</Button>
        </CardContent>
      </Card>
      <p className="text-xs text-muted-foreground">Local entries stored: {getMatchEntries().length}</p>
    </div>
  );
}

function CounterCard({ title, made, attempted, onMade, onAttempt }: { title: string; made: number; attempted: number; onMade: (delta: number) => void; onAttempt: (delta: number) => void }) {
  return (
    <Card>
      <CardHeader><CardTitle>{title}</CardTitle></CardHeader>
      <CardContent className="grid grid-cols-2 gap-3">
        <SmallCounter label="Made" value={made} onChange={onMade} />
        <SmallCounter label="Attempted" value={attempted} onChange={onAttempt} />
      </CardContent>
    </Card>
  );
}

function SmallCounter({ label, value, onChange }: { label: string; value: number; onChange: (delta: number) => void }) {
  return <div className="rounded-md border p-3 text-center"><p className="text-sm text-muted-foreground">{label}</p><p className="text-3xl font-bold">{value}</p><div className="mt-2 grid grid-cols-2 gap-2"><Button size="icon" variant="outline" onClick={() => onChange(-1)}><Minus className="h-4 w-4" /></Button><Button size="icon" onClick={() => onChange(1)}><Plus className="h-4 w-4" /></Button></div></div>;
}

function Slider({ label, value, max, onChange }: { label: string; value: number; max: number; onChange: (value: number) => void }) {
  return <div className="rounded-md border p-3"><div className="mb-2 flex justify-between text-sm"><span>{label}</span><b>{value}/{max}</b></div><input className="w-full accent-primary" type="range" min={0} max={max} value={value} onChange={(e) => onChange(Number(e.target.value))} /></div>;
}
