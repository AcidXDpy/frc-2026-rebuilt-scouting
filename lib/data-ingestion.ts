export type ImportedTeamStat = {
  team: number;
  opr?: number;
  epa?: number;
  autoEpa?: number;
  teleopEpa?: number;
  endgameEpa?: number;
  source: string;
};

export function parseOprCsv(csv: string, source = "csv"): ImportedTeamStat[] {
  const lines = csv.trim().split(/\r?\n/);
  const headers = lines.shift()?.split(",").map((header) => header.trim().toLowerCase()) ?? [];
  const teamIndex = headers.findIndex((header) => ["team", "team_number", "teamnumber"].includes(header));
  const oprIndex = headers.findIndex((header) => ["opr", "offense", "offensive_power_rating"].includes(header));
  if (teamIndex === -1 || oprIndex === -1) return [];

  return lines.map((line) => {
    const cells = line.split(",").map((cell) => cell.trim());
    return {
      team: Number(cells[teamIndex]),
      opr: Number(cells[oprIndex]),
      source
    };
  }).filter((row) => Number.isFinite(row.team) && Number.isFinite(row.opr));
}

export function normalizeImportedStats(rows: ImportedTeamStat[]) {
  const byTeam = new Map<number, ImportedTeamStat>();
  for (const row of rows) {
    const current = byTeam.get(row.team) ?? { team: row.team, source: row.source };
    byTeam.set(row.team, { ...current, ...row, source: [current.source, row.source].filter(Boolean).join("+") });
  }
  return Array.from(byTeam.values()).sort((a, b) => a.team - b.team);
}
