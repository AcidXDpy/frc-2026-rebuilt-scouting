"use client";

import { useState } from "react";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { event, teams } from "@/lib/sample-data";
import { savePitEntry } from "@/lib/offline-store";
import type { PitScoutEntry } from "@/lib/types";

export default function PitPage() {
  const [entry, setEntry] = useState<PitScoutEntry>({
    id: `pit-local-${Date.now()}`,
    eventId: event.id,
    teamNumber: teams[0].number,
    scoutName: "",
    drivetrain: "Swerve",
    weightLbs: 115,
    frameLengthIn: 28,
    frameWidthIn: 28,
    mechanisms: [],
    climbAbility: "Mid Tower",
    scoringLevels: [],
    autoPaths: [],
    driveTeamComments: "",
    reliability: 3,
    repairNotes: "",
    archetypes: [],
    photos: [],
    createdAt: new Date().toISOString()
  });
  const set = <K extends keyof PitScoutEntry>(key: K, value: PitScoutEntry[K]) => setEntry((current) => ({ ...current, [key]: value }));
  const toggle = (key: "mechanisms" | "scoringLevels" | "autoPaths" | "archetypes", value: string) => set(key, entry[key].includes(value) ? entry[key].filter((item) => item !== value) : [...entry[key], value]);

  return (
    <div className="space-y-4">
      <div><h1 className="text-2xl font-bold">Pit Scouting</h1><p className="text-sm text-muted-foreground">Robot profile, mechanisms, photos, reliability, repair notes, and archetype tags.</p></div>
      <Card>
        <CardContent className="grid gap-3 pt-4 md:grid-cols-4">
          <div><Label>Team</Label><Select value={entry.teamNumber} onChange={(e) => set("teamNumber", Number(e.target.value))}>{teams.map((team) => <option key={team.number} value={team.number}>{team.number} · {team.name}</option>)}</Select></div>
          <div><Label>Scout</Label><Input value={entry.scoutName} onChange={(e) => set("scoutName", e.target.value)} /></div>
          <div><Label>Drivetrain</Label><Select value={entry.drivetrain} onChange={(e) => set("drivetrain", e.target.value)}>{["Swerve", "West Coast", "Tank", "Mecanum", "Other"].map((item) => <option key={item}>{item}</option>)}</Select></div>
          <div><Label>Climb Ability</Label><Select value={entry.climbAbility} onChange={(e) => set("climbAbility", e.target.value)}>{event.gameConfig.scoringFields.climb.levels.map((item) => <option key={item}>{item}</option>)}</Select></div>
          <InputBlock label="Weight" value={entry.weightLbs} onChange={(v) => set("weightLbs", v)} />
          <InputBlock label="Length" value={entry.frameLengthIn} onChange={(v) => set("frameLengthIn", v)} />
          <InputBlock label="Width" value={entry.frameWidthIn} onChange={(v) => set("frameWidthIn", v)} />
          <div><Label>Reliability {entry.reliability}/5</Label><input className="mt-3 w-full accent-primary" type="range" min={1} max={5} value={entry.reliability} onChange={(e) => set("reliability", Number(e.target.value))} /></div>
        </CardContent>
      </Card>
      <ToggleGroup title="Mechanisms" values={["wide intake", "over-bumper intake", "adjustable shooter", "fixed shooter", "indexer", "single-stage climb", "double-stage climb"]} selected={entry.mechanisms} onToggle={(value) => toggle("mechanisms", value)} />
      <ToggleGroup title="Scoring / Auto" values={["Hub close", "Hub far", "Auto preload", "Center pickup", "Source side pickup", "Taxi only", "Two-ball auto"]} selected={[...entry.scoringLevels, ...entry.autoPaths]} onToggle={(value) => value.includes("Auto") || value.includes("pickup") || value.includes("Taxi") ? toggle("autoPaths", value) : toggle("scoringLevels", value)} />
      <ToggleGroup title="Robot Archetype" values={event.gameConfig.archetypes} selected={entry.archetypes} onToggle={(value) => toggle("archetypes", value)} />
      <Card><CardHeader><CardTitle>Comments</CardTitle></CardHeader><CardContent className="space-y-3"><Textarea placeholder="Drive team comments" value={entry.driveTeamComments} onChange={(e) => set("driveTeamComments", e.target.value)} /><Textarea placeholder="Reliability and repair notes" value={entry.repairNotes} onChange={(e) => set("repairNotes", e.target.value)} /><Button className="w-full" onClick={() => { savePitEntry(entry); alert("Pit entry saved locally."); }}><Save className="h-4 w-4" /> Save pit entry</Button></CardContent></Card>
    </div>
  );
}

function InputBlock({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return <div><Label>{label}</Label><Input type="number" value={value} onChange={(e) => onChange(Number(e.target.value))} /></div>;
}

function ToggleGroup({ title, values, selected, onToggle }: { title: string; values: string[]; selected: string[]; onToggle: (value: string) => void }) {
  return <Card><CardHeader><CardTitle>{title}</CardTitle></CardHeader><CardContent className="flex flex-wrap gap-2">{values.map((value) => <Button key={value} variant={selected.includes(value) ? "secondary" : "outline"} onClick={() => onToggle(value)}>{value}</Button>)}</CardContent></Card>;
}
