import type { MatchScoutEntry, Team } from "@/lib/types";

export function generateMatchScoutSamples(teams: Team[], eventId: string, countPerTeam = 3): MatchScoutEntry[] {
  return teams.flatMap((team, teamIndex) => Array.from({ length: countPerTeam }, (_, sampleIndex) => {
    const opr = team.eventStats?.opr ?? 70;
    const rank = team.eventStats?.rank ?? teamIndex + 1;
    const matchNumber = teamIndex * countPerTeam + sampleIndex + 1;
    const autoMade = Math.max(1, Math.round((team.eventStats?.avgAutoFuel ?? opr * 0.25) / 8) + sampleIndex % 2);
    const teleMade = Math.max(4, Math.round(opr / 9) + (sampleIndex - 1));
    const defenseRating = Math.max(1, Math.min(5, 6 - Math.ceil(rank / 15)));
    const hasIssue = rank > 50 && sampleIndex === 2;

    return {
      id: `generated-${team.number}-${sampleIndex}`,
      eventId,
      matchId: `generated-qm-${matchNumber}`,
      matchNumber,
      teamNumber: team.number,
      alliance: (teamIndex + sampleIndex) % 2 === 0 ? "red" : "blue",
      station: `${(teamIndex + sampleIndex) % 2 === 0 ? "RED" : "BLUE"} ${(sampleIndex % 3) + 1}`,
      scoutName: ["Avery", "Sam", "Jordan", "Riley", "Morgan"][teamIndex % 5],
      autoFuelMade: autoMade,
      autoFuelAttempted: autoMade + 2 + (rank % 2),
      teleFuelMade: teleMade,
      teleFuelAttempted: teleMade + 4 + (rank % 3),
      intakeSource: teamIndex % 3 === 0 ? "Ground" : teamIndex % 3 === 1 ? "Both" : "Human Player",
      cycleTimes: [16 + rank % 9, 17 + sampleIndex + rank % 7, 18 + rank % 5, 20 + sampleIndex],
      towerClimbLevel: (team.eventStats?.avgTower ?? 0) > 8 ? "Traversal Tower" : (team.eventStats?.avgTower ?? 0) > 2 ? "High Tower" : (team.eventStats?.avgTower ?? 0) > 0 ? "Mid Tower" : "Park",
      climbSuccess: (team.eventStats?.avgTower ?? 0) > 0 || rank < 30,
      defenseRating,
      driverSkill: Math.max(2, Math.min(5, 6 - Math.ceil(rank / 18))),
      penalties: hasIssue ? 1 : 0,
      fouls: rank > 55 && sampleIndex === 1 ? 1 : 0,
      disabled: hasIssue && rank > 60,
      tipped: false,
      connectionIssues: hasIssue && rank > 58,
      breakdowns: hasIssue ? "Review reliability before playoffs." : "",
      quickNotes: rank <= 16 ? ["DCMP top 16", "Fast cycles"] : rank <= 33 ? ["Playoff bubble"] : ["Needs validation"],
      notes: "Generated from event ranking and OPR imports; replace with real scout entries when available.",
      createdAt: new Date().toISOString(),
      synced: true
    };
  }));
}
