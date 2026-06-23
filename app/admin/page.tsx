"use client";

import { useState } from "react";
import { Download, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PageHeading } from "@/components/page-heading";
import { event, matches, matchEntries, teams } from "@/lib/sample-data";
import { exportCsv, parseCsv } from "@/lib/stats";

export default function AdminPage() {
  const [configText, setConfigText] = useState(JSON.stringify(event.gameConfig, null, 2));
  const [importStatus, setImportStatus] = useState("");

  function downloadCsv() {
    const csv = exportCsv(matchEntries as unknown as Record<string, unknown>[]);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "rebuilt-match-scouting.csv";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  async function importSchedule(file: File) {
    const rows = parseCsv(await file.text());
    setImportStatus(`Parsed ${rows.length} schedule row(s). Expected columns: matchNumber, red1, red2, red3, blue1, blue2, blue3.`);
  }

  return (
    <div className="space-y-5">
      <PageHeading eyebrow="system control" title="Admin & Config" description="Events, users, scout assignments, schedule import, TBA integration, game fields, and point values." />
      <section className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Event Setup</CardTitle></CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            <div><Label>Event Key</Label><Input defaultValue={event.key} /></div>
            <div><Label>Event Name</Label><Input defaultValue={event.name} /></div>
            <div><Label>Location</Label><Input defaultValue={event.location} /></div>
            <div><Label>Teams</Label><Input readOnly value={teams.map((team) => team.number).join(", ")} /></div>
            <Button variant="outline" className="sm:col-span-2" onClick={() => { localStorage.setItem("rebuilt.eventSettings", JSON.stringify({ event, savedAt: new Date().toISOString() })); alert("Event settings saved locally. Connect this form to Prisma for production writes."); }}>Save event settings</Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>CSV / TBA</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <Button onClick={downloadCsv}><Download className="h-4 w-4" /> Export scouting CSV</Button>
            <label className="block rounded-md border p-3 text-sm">
              <span className="mb-2 flex items-center gap-2 font-medium"><Upload className="h-4 w-4" /> Import schedule CSV</span>
              <Input type="file" accept=".csv" onChange={(event) => event.target.files?.[0] && void importSchedule(event.target.files[0])} />
            </label>
            <Button variant="outline" onClick={() => setImportStatus("TBA import ready. Add TBA_API_KEY and wire /api/tba/event/[key] for live schedule pulls.")}>Check TBA integration</Button>
            <p className="text-sm text-muted-foreground">{importStatus || `${matches.length} sample matches loaded.`}</p>
          </CardContent>
        </Card>
      </section>
      <Card>
        <CardHeader><CardTitle>Configurable Game Model</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <Textarea className="min-h-96 font-mono text-xs" value={configText} onChange={(event) => setConfigText(event.target.value)} />
          <Button onClick={() => { JSON.parse(configText); alert("Config JSON is valid. In production this saves to GameConfig."); }}>Validate game config</Button>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>User Roles & Assignments</CardTitle></CardHeader>
        <CardContent className="grid gap-2 sm:grid-cols-4">
          {["admin", "strategy lead", "scout", "viewer"].map((role) => <div key={role} className="rounded-md border p-3"><p className="font-medium capitalize">{role}</p><p className="text-xs text-muted-foreground">Managed by Auth provider claims and User.role.</p></div>)}
        </CardContent>
      </Card>
    </div>
  );
}
