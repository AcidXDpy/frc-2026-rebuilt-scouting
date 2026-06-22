import { PrismaClient, UserRole } from "@prisma/client";
import { defaultGameConfig } from "../lib/game-config";
import { event, matches, matchEntries, pitEntries, teams } from "../lib/sample-data";

const prisma = new PrismaClient();

async function main() {
  const admin = await prisma.user.upsert({
    where: { email: "admin@rebuilt.local" },
    update: {},
    create: { email: "admin@rebuilt.local", name: "Strategy Admin", role: UserRole.ADMIN }
  });

  const savedEvent = await prisma.event.upsert({
    where: { key: event.key },
    update: {},
    create: {
      key: event.key,
      name: event.name,
      location: event.location,
      startsAt: new Date(event.startsAt),
      endsAt: new Date(event.endsAt),
      gameConfig: {
        create: {
          gameName: defaultGameConfig.gameName,
          season: defaultGameConfig.season,
          scoringFields: defaultGameConfig.scoringFields,
          pointValues: defaultGameConfig.pointValues,
          validations: defaultGameConfig.validations,
          climbLevels: defaultGameConfig.scoringFields.climb.levels,
          quickNotes: defaultGameConfig.quickNotes
        }
      }
    }
  });

  for (const team of teams) {
    const savedTeam = await prisma.team.upsert({
      where: { number: team.number },
      update: { name: team.name, city: team.city, state: team.state },
      create: { number: team.number, name: team.name, city: team.city, state: team.state, country: "USA" }
    });
    await prisma.eventTeam.upsert({
      where: { eventId_teamId: { eventId: savedEvent.id, teamId: savedTeam.id } },
      update: {},
      create: { eventId: savedEvent.id, teamId: savedTeam.id }
    });
  }

  for (const match of matches) {
    const savedMatch = await prisma.match.upsert({
      where: { eventId_level_matchNumber: { eventId: savedEvent.id, level: "QUALIFICATION", matchNumber: match.number } },
      update: { redScore: match.redScore, blueScore: match.blueScore },
      create: {
        eventId: savedEvent.id,
        matchNumber: match.number,
        scheduledAt: new Date(match.time),
        redScore: match.redScore,
        blueScore: match.blueScore
      }
    });
    await prisma.alliance.upsert({
      where: { matchId_color: { matchId: savedMatch.id, color: "RED" } },
      update: { team1: match.red[0], team2: match.red[1], team3: match.red[2] },
      create: { matchId: savedMatch.id, color: "RED", team1: match.red[0], team2: match.red[1], team3: match.red[2] }
    });
    await prisma.alliance.upsert({
      where: { matchId_color: { matchId: savedMatch.id, color: "BLUE" } },
      update: { team1: match.blue[0], team2: match.blue[1], team3: match.blue[2] },
      create: { matchId: savedMatch.id, color: "BLUE", team1: match.blue[0], team2: match.blue[1], team3: match.blue[2] }
    });
  }

  for (const entry of matchEntries) {
    const team = await prisma.team.findUniqueOrThrow({ where: { number: entry.teamNumber } });
    const match = await prisma.match.findFirstOrThrow({ where: { eventId: savedEvent.id, matchNumber: entry.matchNumber } });
    await prisma.matchScoutEntry.upsert({
      where: { id: entry.id },
      update: {},
      create: {
        id: entry.id,
        eventId: savedEvent.id,
        matchId: match.id,
        teamId: team.id,
        scoutId: admin.id,
        alliance: entry.alliance.toUpperCase() as "RED" | "BLUE",
        station: entry.station,
        autoFuelMade: entry.autoFuelMade,
        autoFuelAttempted: entry.autoFuelAttempted,
        teleFuelMade: entry.teleFuelMade,
        teleFuelAttempted: entry.teleFuelAttempted,
        hubAccuracy: entry.autoFuelAttempted + entry.teleFuelAttempted ? (entry.autoFuelMade + entry.teleFuelMade) / (entry.autoFuelAttempted + entry.teleFuelAttempted) : 0,
        intakeSource: entry.intakeSource,
        cycleTimes: entry.cycleTimes,
        towerClimbLevel: entry.towerClimbLevel,
        climbSuccess: entry.climbSuccess,
        defenseRating: entry.defenseRating,
        driverSkill: entry.driverSkill,
        penalties: entry.penalties,
        fouls: entry.fouls,
        disabled: entry.disabled,
        tipped: entry.tipped,
        connectionIssues: entry.connectionIssues,
        breakdowns: entry.breakdowns,
        quickNotes: entry.quickNotes,
        notes: entry.notes,
        synced: true
      }
    });
  }

  for (const pit of pitEntries) {
    const team = await prisma.team.findUniqueOrThrow({ where: { number: pit.teamNumber } });
    await prisma.pitScoutEntry.upsert({
      where: { id: pit.id },
      update: {},
      create: {
        id: pit.id,
        eventId: savedEvent.id,
        teamId: team.id,
        scoutId: admin.id,
        drivetrain: pit.drivetrain,
        weightLbs: pit.weightLbs,
        frameLengthIn: pit.frameLengthIn,
        frameWidthIn: pit.frameWidthIn,
        mechanisms: pit.mechanisms,
        climbAbility: pit.climbAbility,
        scoringLevels: pit.scoringLevels,
        autoPaths: pit.autoPaths,
        driveTeamComments: pit.driveTeamComments,
        reliability: pit.reliability,
        repairNotes: pit.repairNotes,
        archetypes: pit.archetypes
      }
    });
  }
}

main().finally(async () => prisma.$disconnect());
