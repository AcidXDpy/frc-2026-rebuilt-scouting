import { defaultGameConfig } from "@/lib/game-config";
import type { Match, MatchScoutEntry, PitScoutEntry, Team } from "@/lib/types";

export const event = {
  id: "2026fma-dcmp",
  key: "2026fma-dcmp",
  name: "FIRST Mid-Atlantic District Championship 2026",
  location: "Lehigh University - Stabler Arena, Bethlehem, PA",
  startsAt: "2026-04-15",
  endsAt: "2026-04-18",
  gameConfig: defaultGameConfig
};

const team = (number: number, name: string, city: string, state: string): Team => ({
  number,
  name,
  city,
  state,
  strengths: ["needs scouting"],
  weaknesses: ["needs scouting"],
  strategyNotes: "Collect event-specific match and pit data before assigning a final role."
});

const allFmaTeams: Team[] = [
  { ...team(11, "MORT", "Flanders", "New Jersey"), strengths: ["home-team familiarity", "driver practice", "systems knowledge"], weaknesses: ["verify 2026 robot data at event"], strategyNotes: "Primary team profile. Keep pit notes, match clips, and reliability flags current for drive-team planning." },
  team(25, "Raider Robotix", "North Brunswick", "New Jersey"),
  team(41, "RoboWarriors", "Warren", "New Jersey"),
  team(56, "R.O.B.B.E.", "Bound Brook", "New Jersey"),
  team(75, "RoboRaiders", "Hillsborough", "New Jersey"),
  team(87, "Diablo", "Mount Holly", "New Jersey"),
  team(102, "The Gearheads", "Somerville", "New Jersey"),
  team(103, "Cybersonics", "Kintnersville", "Pennsylvania"),
  { ...team(193, "MORT Beta", "Flanders", "New Jersey"), strengths: ["program familiarity"], weaknesses: ["verify event role"], strategyNotes: "Track separately from MORT for assignment and data quality." },
  team(203, "SOUPERBOTS", "Sicklerville", "New Jersey"),
  team(204, "Eastern Robotic Vikings", "Voorhees", "New Jersey"),
  team(219, "Team Impact", "Washington", "New Jersey"),
  team(222, "Tigertrons", "Tunkhannock", "Pennsylvania"),
  team(223, "Xtreme Heat", "Wanaque", "New Jersey"),
  team(272, "Cyber Crusaders", "Lansdale", "Pennsylvania"),
  team(293, "SPIKE", "Pennington", "New Jersey"),
  team(303, "The T.E.S.T. Team", "Bridgewater", "New Jersey"),
  team(316, "LUNATECS", "Carneys Point", "New Jersey"),
  team(321, "RoboLancers", "Philadelphia", "Pennsylvania"),
  team(341, "Miss Daisy", "Ambler", "Pennsylvania"),
  team(365, "Miracle Workerz", "Wilmington", "Delaware"),
  team(423, "Simple Machines", "Elkins Park", "Pennsylvania"),
  team(427, "LANCE-A-LOT", "Philadelphia", "Pennsylvania"),
  team(428, "BoroBlasters", "Hillsborough", "New Jersey"),
  { ...team(430, "MORT GAMMA", "Budd Lake", "New Jersey"), strengths: ["program familiarity"], weaknesses: ["verify event role"], strategyNotes: "Track as its own team for assignments and metrics." },
  team(433, "Firebirds", "Flourtown", "Pennsylvania"),
  team(484, "Roboforce", "Havertown", "Pennsylvania"),
  team(486, "Positronic Panthers", "Wallingford", "Pennsylvania"),
  team(555, "Montclair Robotics", "Montclair", "New Jersey"),
  team(708, "Hatters Robotics", "Horsham", "Pennsylvania"),
  team(709, "Femme Tech Fatale", "Bryn Mawr", "Pennsylvania"),
  team(714, "Panthera", "Newark", "New Jersey"),
  team(752, "Chargers", "Newark", "New Jersey"),
  team(816, "Anomaly", "Mount Holly", "New Jersey"),
  team(834, "SparTechs", "Center Valley", "Pennsylvania"),
  team(1089, "Team Mercury", "Hightstown", "New Jersey"),
  team(1168, "Malvern Robotics", "Malvern", "Pennsylvania"),
  team(1218, "SCH Robotics", "Philadelphia", "Pennsylvania"),
  team(1257, "Parallel Universe", "Scotch Plains", "New Jersey"),
  team(1279, "Cold Fusion", "Somerville", "New Jersey"),
  team(1391, "The Metal Moose", "West Chester", "Pennsylvania"),
  team(1403, "Team 1403 Cougar Robotics", "Skillman", "New Jersey"),
  team(1626, "Falcon Robotics", "Metuchen", "New Jersey"),
  team(1640, "Sab-BOT-age", "Downingtown", "Pennsylvania"),
  team(1647, "Iron Devils", "Tabernacle", "New Jersey"),
  team(1672, "Robo T-Birds", "Mahwah", "New Jersey"),
  team(1676, "The Pascack PI-oneers", "Montvale", "New Jersey"),
  team(1712, "Dawgma", "Ardmore", "Pennsylvania"),
  team(1807, "Redbird Robotics", "Allentown", "New Jersey"),
  team(1811, "FRESH", "Newark", "New Jersey"),
  team(1923, "The MidKnight Inventors", "Plainsboro", "New Jersey"),
  team(2016, "Mighty Monkey Wrenches", "Ewing", "New Jersey"),
  team(2095, "Direct Current", "Newtown Square", "Pennsylvania"),
  team(2180, "Zero Gravity", "Hamilton", "New Jersey"),
  team(2191, "Flux Core", "Hamilton", "New Jersey"),
  team(2234, "Alternating Current", "Newtown Square", "Pennsylvania"),
  team(2458, "Team Chaos", "Gladstone", "New Jersey"),
  team(2495, "Hive Mind", "Hamilton", "New Jersey"),
  team(2539, "Krypton Cougars", "Palmyra", "Pennsylvania"),
  team(2554, "The Warhawks", "Edison", "New Jersey"),
  team(2559, "Normality Zero", "Harrisburg", "Pennsylvania"),
  team(2577, "Pingry Robotics", "Basking Ridge", "New Jersey"),
  team(2590, "Nemesis", "Robbinsville", "New Jersey"),
  team(2607, "The Fighting RoboVikings", "Warminster", "Pennsylvania"),
  team(2720, "Red Watch Robotics", "Medford", "New Jersey"),
  team(2722, "Charge Robotics", "Marlton", "New Jersey"),
  team(3142, "Aperture", "Newton", "New Jersey"),
  team(3314, "Mechanical Mustangs", "Clifton", "New Jersey"),
  team(3340, "Union City EagleX Robotics", "Union City", "New Jersey"),
  team(3637, "The Daleks", "Flemington", "New Jersey"),
  team(4285, "Camo-Bots", "Honesdale", "Pennsylvania"),
  team(4342, "Demon Robotics", "Kennett Square", "Pennsylvania"),
  team(4361, "Roxbotix", "Roxbury Township", "New Jersey"),
  team(4573, "Rambotics", "South River", "New Jersey"),
  team(4575, "Gemini", "Media", "Pennsylvania"),
  team(4637, "BambieBotz", "Philadelphia", "Pennsylvania"),
  team(4652, "Ironmen 2", "Ramsey", "New Jersey"),
  team(4653, "Ironmen Robotics", "Ramsey", "New Jersey"),
  team(4750, "Bert", "Pennsauken", "New Jersey"),
  team(5113, "Combustible Lemons", "Moorestown", "New Jersey"),
  team(5181, "Explorer Robotics", "Wyndmoor", "Pennsylvania"),
  team(5401, "Fightin' Robotic Owls", "Bensalem", "Pennsylvania"),
  team(5407, "Wolfpack Robotics", "Conshohocken", "Pennsylvania"),
  team(5438, "Technological Terrors", "Jersey City", "New Jersey"),
  team(5490, "The Dark Byte", "Bethlehem", "Pennsylvania"),
  team(5624, "TIGER TECH Robotics", "South Plainfield", "New Jersey"),
  team(5684, "Titans of Tech", "Hamilton", "New Jersey"),
  team(5732, "ROBOTIGERS", "Bloomfield", "New Jersey"),
  team(5789, "The Other Owls", "Bensalem", "Pennsylvania"),
  team(5895, "Peddie Robotics", "Hightstown", "New Jersey"),
  team(5992, "Pirates", "West Orange", "New Jersey"),
  team(6016, "Tiger Robotics", "Hackettstown", "New Jersey"),
  team(6226, "Blue Devils", "Burlington", "New Jersey"),
  team(6808, "William Tennent Robotics", "Warminster", "Pennsylvania"),
  team(6860, "Equitum Robotics", "Paterson", "New Jersey"),
  team(6897, "Astraea Robotics", "East Brunswick", "New Jersey"),
  team(6921, "Technados", "Pennsauken", "New Jersey"),
  team(6945, "Children of the Corn", "Blairstown", "New Jersey"),
  team(7045, "MCCrusaders", "Denville", "New Jersey"),
  team(7110, "Heights Bytes", "Haddon Heights", "New Jersey"),
  team(7414, "Retrobotics", "Collegeville", "Pennsylvania"),
  team(7587, "Metuchen Momentum", "Metuchen", "New Jersey"),
  team(8075, "CyberTigers", "Dover", "New Jersey"),
  team(8117, "Easton RoboRovers", "Easton", "Pennsylvania"),
  team(8130, "Absegami Robotics", "Absecon", "New Jersey"),
  team(8513, "Sisters 1st", "Morristown", "New Jersey"),
  team(8588, "Tech Devils", "Denville", "New Jersey"),
  team(8628, "Newark School of Global Studies", "Newark", "New Jersey"),
  team(8630, "CAP ROBOTICS", "Paterson", "New Jersey"),
  team(8704, "Void Warranty", "Cape May", "New Jersey"),
  team(8706, "MXS Bulldog Bots", "Newark", "New Jersey"),
  team(8707, "The Newark Circuit Breakers", "Newark", "New Jersey"),
  team(8714, "Robo Griffins'", "Toms River", "New Jersey"),
  team(8721, "Code Name M.I.T.", "Cape May Court House", "New Jersey"),
  team(8771, "PioTech", "Wayne", "New Jersey"),
  team(9014, "Vulcan Mechanics", "Philadelphia", "Pennsylvania"),
  team(9015, "Questionable Engineering", "Jersey City", "New Jersey"),
  team(9027, "PATH to Domination", "Norristown", "Pennsylvania"),
  team(9094, "The Earthquakers", "Wynnewood", "Pennsylvania"),
  team(9100, "Robo Roses", "Belmar", "New Jersey"),
  team(9116, "The Canucks & Bolts", "North Plainfield", "New Jersey"),
  team(9416, "International Operatives of World Affairs", "Philadelphia", "Pennsylvania"),
  team(9424, "E.O. JAG BOTS", "East Orange", "New Jersey"),
  team(9439, "Knights of Polaris", "Newark", "New Jersey"),
  team(10070, "Ghost Bots", "Abington", "Pennsylvania"),
  team(10143, "Northeast Vikings", "Philadelphia", "Pennsylvania"),
  team(10157, "Roman Robotics", "Philadelphia", "Pennsylvania"),
  team(10170, "ND Robotics", "Lawrence Township", "New Jersey"),
  team(10232, "Killer Kardinals 2", "Plainfield", "New Jersey"),
  team(10366, "Builder Bears", "Bergenfield", "New Jersey"),
  team(10400, "DART Doane Academy Robotics Team", "Burlington", "New Jersey"),
  team(10584, "Ridge Robotics", "Perkasie", "Pennsylvania"),
  team(10600, "Two Steps Ahead", "Edison", "New Jersey"),
  team(10918, "Bluesteel Dragons", "Philadelphia", "Pennsylvania"),
  team(10949, "Metalheads", "Philadelphia", "Pennsylvania"),
  team(10979, "Tiger Robotics", "Philadelphia", "Pennsylvania"),
  team(10989, "Blast Robotics", "Berwyn", "Pennsylvania"),
  team(10993, "EP Robotics", "Enola", "Pennsylvania"),
  team(10995, "ACS Eagle Robotics", "Rockaway", "New Jersey"),
  team(10997, "St. George", "Jersey City", "New Jersey"),
  team(11104, "Phoenix Phanatics", "East Brunswick", "New Jersey"),
  team(11225, "Wolfimus", "Camden", "New Jersey"),
  team(11366, "Red Devil's Redemption", "West Grove", "Pennsylvania")
];

type FmaDcmpRanking = {
  rank: number;
  teamNumber: number;
  rankingScore: number;
  avgMatch: number;
  avgAutoFuel: number;
  avgTower: number;
  record: string;
  played: number;
  rankingPoints: number;
};

export const fmaDcmpOpr: Record<number, number> = {
  316: 264.96,
  2539: 218.56,
  5895: 184.15,
  484: 182.62,
  1403: 178.59,
  8513: 177.35,
  341: 173.50,
  103: 173.38,
  272: 159.84,
  9094: 147.70,
  1391: 147.65,
  193: 146.48,
  1089: 144.97,
  1640: 143.92,
  1218: 143.68,
  11: 142.68,
  1676: 142.65,
  2590: 138.09,
  4285: 129.87,
  3637: 122.70,
  8706: 112.21,
  3314: 104.49,
  303: 96.96,
  6921: 93.90,
  5438: 91.43,
  5181: 89.79,
  10070: 89.53,
  5401: 89.00,
  2607: 88.77,
  293: 86.92,
  1807: 84.86,
  223: 82.02,
  365: 81.23,
  2016: 74.53,
  75: 68.01,
  41: 67.26,
  433: 66.64,
  7045: 65.41,
  25: 64.45,
  10993: 62.45,
  555: 62.26,
  708: 58.87,
  1923: 53.61,
  222: 53.27,
  10979: 50.96,
  56: 48.14,
  1672: 47.55,
  9027: 45.18,
  10157: 44.69,
  1168: 41.82,
  5113: 39.74,
  423: 38.96,
  486: 38.80,
  4575: 38.33,
  9416: 36.16,
  427: 31.79,
  10584: 31.54,
  8075: 31.39,
  9015: 26.77,
  7587: 26.04,
  1712: 23.72,
  10949: 20.79,
  8117: 14.00,
  2554: 9.92,
  10918: 0.99,
  7110: -17.26
};

export const fmaDcmpRankings: FmaDcmpRanking[] = [
  { rank: 1, teamNumber: 316, rankingScore: 4.50, avgMatch: 437.17, avgAutoFuel: 98.17, avgTower: 0.00, record: "11-1-0", played: 12, rankingPoints: 54 },
  { rank: 2, teamNumber: 2539, rankingScore: 4.08, avgMatch: 400.00, avgAutoFuel: 62.75, avgTower: 2.08, record: "9-3-0", played: 12, rankingPoints: 49 },
  { rank: 3, teamNumber: 484, rankingScore: 4.00, avgMatch: 366.33, avgAutoFuel: 73.67, avgTower: 0.00, record: "10-2-0", played: 12, rankingPoints: 48 },
  { rank: 4, teamNumber: 1403, rankingScore: 3.75, avgMatch: 375.50, avgAutoFuel: 71.92, avgTower: 2.08, record: "9-3-0", played: 12, rankingPoints: 45 },
  { rank: 5, teamNumber: 3314, rankingScore: 3.58, avgMatch: 307.33, avgAutoFuel: 65.25, avgTower: 2.92, record: "10-2-0", played: 12, rankingPoints: 43 },
  { rank: 6, teamNumber: 341, rankingScore: 3.58, avgMatch: 302.58, avgAutoFuel: 51.92, avgTower: 3.33, record: "10-2-0", played: 12, rankingPoints: 43 },
  { rank: 7, teamNumber: 1676, rankingScore: 3.50, avgMatch: 332.75, avgAutoFuel: 78.33, avgTower: 1.25, record: "9-3-0", played: 12, rankingPoints: 42 },
  { rank: 8, teamNumber: 8513, rankingScore: 3.42, avgMatch: 366.17, avgAutoFuel: 86.17, avgTower: 2.92, record: "8-4-0", played: 12, rankingPoints: 41 },
  { rank: 9, teamNumber: 5895, rankingScore: 3.42, avgMatch: 339.17, avgAutoFuel: 75.50, avgTower: 2.92, record: "9-3-0", played: 12, rankingPoints: 41 },
  { rank: 10, teamNumber: 11, rankingScore: 3.33, avgMatch: 324.92, avgAutoFuel: 57.67, avgTower: 2.92, record: "9-3-0", played: 12, rankingPoints: 40 },
  { rank: 11, teamNumber: 9094, rankingScore: 3.33, avgMatch: 317.75, avgAutoFuel: 53.75, avgTower: 1.67, record: "9-3-0", played: 12, rankingPoints: 40 },
  { rank: 12, teamNumber: 1089, rankingScore: 3.17, avgMatch: 322.75, avgAutoFuel: 64.58, avgTower: 0.83, record: "8-4-0", played: 12, rankingPoints: 38 },
  { rank: 13, teamNumber: 1640, rankingScore: 3.17, avgMatch: 321.08, avgAutoFuel: 64.00, avgTower: 1.67, record: "8-4-0", played: 12, rankingPoints: 38 },
  { rank: 14, teamNumber: 272, rankingScore: 3.08, avgMatch: 314.25, avgAutoFuel: 70.50, avgTower: 0.83, record: "8-4-0", played: 12, rankingPoints: 37 },
  { rank: 15, teamNumber: 5401, rankingScore: 3.08, avgMatch: 288.42, avgAutoFuel: 50.75, avgTower: 1.67, record: "9-3-0", played: 12, rankingPoints: 37 },
  { rank: 16, teamNumber: 103, rankingScore: 3.00, avgMatch: 344.00, avgAutoFuel: 68.67, avgTower: 0.83, record: "7-5-0", played: 12, rankingPoints: 36 },
  { rank: 17, teamNumber: 3637, rankingScore: 3.00, avgMatch: 308.75, avgAutoFuel: 61.42, avgTower: 0.00, record: "8-4-0", played: 12, rankingPoints: 36 },
  { rank: 18, teamNumber: 1218, rankingScore: 2.83, avgMatch: 314.42, avgAutoFuel: 59.92, avgTower: 1.25, record: "7-5-0", played: 12, rankingPoints: 34 },
  { rank: 19, teamNumber: 1391, rankingScore: 2.83, avgMatch: 309.67, avgAutoFuel: 61.67, avgTower: 0.00, record: "7-5-0", played: 12, rankingPoints: 34 },
  { rank: 20, teamNumber: 5438, rankingScore: 2.75, avgMatch: 266.75, avgAutoFuel: 56.67, avgTower: 2.92, record: "8-4-0", played: 12, rankingPoints: 33 },
  { rank: 21, teamNumber: 555, rankingScore: 2.67, avgMatch: 266.17, avgAutoFuel: 56.92, avgTower: 2.92, record: "7-5-0", played: 12, rankingPoints: 32 },
  { rank: 22, teamNumber: 193, rankingScore: 2.58, avgMatch: 318.67, avgAutoFuel: 51.67, avgTower: 0.83, record: "6-6-0", played: 12, rankingPoints: 31 },
  { rank: 23, teamNumber: 75, rankingScore: 2.58, avgMatch: 232.33, avgAutoFuel: 46.25, avgTower: 0.00, record: "8-4-0", played: 12, rankingPoints: 31 },
  { rank: 24, teamNumber: 6921, rankingScore: 2.50, avgMatch: 284.08, avgAutoFuel: 49.50, avgTower: 0.83, record: "7-5-0", played: 12, rankingPoints: 30 },
  { rank: 25, teamNumber: 486, rankingScore: 2.50, avgMatch: 232.33, avgAutoFuel: 39.17, avgTower: 5.00, record: "8-4-0", played: 12, rankingPoints: 30 },
  { rank: 26, teamNumber: 365, rankingScore: 2.33, avgMatch: 277.42, avgAutoFuel: 51.83, avgTower: 2.08, record: "6-6-0", played: 12, rankingPoints: 28 },
  { rank: 27, teamNumber: 2607, rankingScore: 2.25, avgMatch: 256.08, avgAutoFuel: 50.42, avgTower: 1.25, record: "6-6-0", played: 12, rankingPoints: 27 },
  { rank: 28, teamNumber: 10993, rankingScore: 2.25, avgMatch: 241.92, avgAutoFuel: 47.25, avgTower: 2.08, record: "7-5-0", played: 12, rankingPoints: 27 },
  { rank: 29, teamNumber: 2590, rankingScore: 2.17, avgMatch: 285.08, avgAutoFuel: 61.25, avgTower: 0.00, record: "5-7-0", played: 12, rankingPoints: 26 },
  { rank: 30, teamNumber: 4285, rankingScore: 2.17, avgMatch: 283.92, avgAutoFuel: 44.92, avgTower: 2.08, record: "6-6-0", played: 12, rankingPoints: 26 },
  { rank: 31, teamNumber: 293, rankingScore: 2.17, avgMatch: 264.83, avgAutoFuel: 54.75, avgTower: 0.00, record: "6-6-0", played: 12, rankingPoints: 26 },
  { rank: 32, teamNumber: 7045, rankingScore: 2.17, avgMatch: 242.92, avgAutoFuel: 52.08, avgTower: 2.08, record: "6-6-0", played: 12, rankingPoints: 26 },
  { rank: 33, teamNumber: 10070, rankingScore: 2.08, avgMatch: 266.00, avgAutoFuel: 56.17, avgTower: 17.08, record: "5-7-0", played: 12, rankingPoints: 25 },
  { rank: 34, teamNumber: 1807, rankingScore: 2.08, avgMatch: 236.33, avgAutoFuel: 50.25, avgTower: 3.75, record: "6-6-0", played: 12, rankingPoints: 25 },
  { rank: 35, teamNumber: 1168, rankingScore: 2.08, avgMatch: 216.50, avgAutoFuel: 51.08, avgTower: 2.92, record: "7-5-0", played: 12, rankingPoints: 25 },
  { rank: 36, teamNumber: 8706, rankingScore: 2.00, avgMatch: 305.17, avgAutoFuel: 62.67, avgTower: 2.08, record: "4-8-0", played: 12, rankingPoints: 24 },
  { rank: 37, teamNumber: 423, rankingScore: 2.00, avgMatch: 232.92, avgAutoFuel: 35.50, avgTower: 0.00, record: "5-7-0", played: 12, rankingPoints: 24 },
  { rank: 38, teamNumber: 8075, rankingScore: 2.00, avgMatch: 223.25, avgAutoFuel: 48.92, avgTower: 0.83, record: "6-6-0", played: 12, rankingPoints: 24 },
  { rank: 39, teamNumber: 25, rankingScore: 1.92, avgMatch: 241.08, avgAutoFuel: 49.25, avgTower: 0.83, record: "6-6-0", played: 12, rankingPoints: 23 },
  { rank: 40, teamNumber: 56, rankingScore: 1.92, avgMatch: 215.17, avgAutoFuel: 39.75, avgTower: 1.67, record: "6-6-0", played: 12, rankingPoints: 23 },
  { rank: 41, teamNumber: 303, rankingScore: 1.83, avgMatch: 244.92, avgAutoFuel: 52.33, avgTower: 0.00, record: "5-7-0", played: 12, rankingPoints: 22 },
  { rank: 42, teamNumber: 10157, rankingScore: 1.83, avgMatch: 216.83, avgAutoFuel: 36.75, avgTower: 0.83, record: "6-6-0", played: 12, rankingPoints: 22 },
  { rank: 43, teamNumber: 5181, rankingScore: 1.75, avgMatch: 264.50, avgAutoFuel: 48.33, avgTower: 3.75, record: "5-7-0", played: 12, rankingPoints: 21 },
  { rank: 44, teamNumber: 2016, rankingScore: 1.75, avgMatch: 218.33, avgAutoFuel: 35.58, avgTower: 1.25, record: "5-7-0", played: 12, rankingPoints: 21 },
  { rank: 45, teamNumber: 222, rankingScore: 1.67, avgMatch: 249.00, avgAutoFuel: 52.42, avgTower: 2.50, record: "4-8-0", played: 12, rankingPoints: 20 },
  { rank: 46, teamNumber: 223, rankingScore: 1.67, avgMatch: 238.25, avgAutoFuel: 38.58, avgTower: 0.83, record: "5-7-0", played: 12, rankingPoints: 20 },
  { rank: 47, teamNumber: 10918, rankingScore: 1.58, avgMatch: 208.25, avgAutoFuel: 40.42, avgTower: 10.00, record: "5-7-0", played: 12, rankingPoints: 19 },
  { rank: 48, teamNumber: 1923, rankingScore: 1.50, avgMatch: 227.25, avgAutoFuel: 50.42, avgTower: 1.25, record: "4-8-0", played: 12, rankingPoints: 18 },
  { rank: 49, teamNumber: 9027, rankingScore: 1.50, avgMatch: 194.50, avgAutoFuel: 42.67, avgTower: 0.00, record: "4-8-0", played: 12, rankingPoints: 18 },
  { rank: 50, teamNumber: 9015, rankingScore: 1.50, avgMatch: 173.00, avgAutoFuel: 25.33, avgTower: 1.25, record: "5-7-0", played: 12, rankingPoints: 18 },
  { rank: 51, teamNumber: 708, rankingScore: 1.42, avgMatch: 230.58, avgAutoFuel: 39.42, avgTower: 4.58, record: "4-8-0", played: 12, rankingPoints: 17 },
  { rank: 52, teamNumber: 1712, rankingScore: 1.42, avgMatch: 205.75, avgAutoFuel: 43.42, avgTower: 0.00, record: "4-8-0", played: 12, rankingPoints: 17 },
  { rank: 53, teamNumber: 4575, rankingScore: 1.42, avgMatch: 198.33, avgAutoFuel: 38.33, avgTower: 1.25, record: "4-8-0", played: 12, rankingPoints: 17 },
  { rank: 54, teamNumber: 433, rankingScore: 1.33, avgMatch: 225.75, avgAutoFuel: 33.75, avgTower: 0.00, record: "3-9-0", played: 12, rankingPoints: 16 },
  { rank: 55, teamNumber: 10584, rankingScore: 1.33, avgMatch: 194.42, avgAutoFuel: 41.25, avgTower: 8.75, record: "4-8-0", played: 12, rankingPoints: 16 },
  { rank: 56, teamNumber: 10979, rankingScore: 1.33, avgMatch: 190.08, avgAutoFuel: 33.08, avgTower: 0.83, record: "4-8-0", played: 12, rankingPoints: 16 },
  { rank: 57, teamNumber: 7587, rankingScore: 1.33, avgMatch: 175.83, avgAutoFuel: 34.17, avgTower: 0.00, record: "4-8-0", played: 12, rankingPoints: 16 },
  { rank: 58, teamNumber: 41, rankingScore: 1.25, avgMatch: 218.75, avgAutoFuel: 37.83, avgTower: 0.00, record: "3-9-0", played: 12, rankingPoints: 15 },
  { rank: 59, teamNumber: 1672, rankingScore: 1.17, avgMatch: 224.33, avgAutoFuel: 40.00, avgTower: 0.00, record: "3-9-0", played: 12, rankingPoints: 14 },
  { rank: 60, teamNumber: 427, rankingScore: 1.17, avgMatch: 202.67, avgAutoFuel: 43.08, avgTower: 0.00, record: "3-9-0", played: 12, rankingPoints: 14 },
  { rank: 61, teamNumber: 5113, rankingScore: 1.17, avgMatch: 199.25, avgAutoFuel: 40.58, avgTower: 0.00, record: "3-9-0", played: 12, rankingPoints: 14 },
  { rank: 62, teamNumber: 8117, rankingScore: 1.08, avgMatch: 204.00, avgAutoFuel: 39.92, avgTower: 3.75, record: "4-8-0", played: 12, rankingPoints: 13 },
  { rank: 63, teamNumber: 7110, rankingScore: 0.92, avgMatch: 157.25, avgAutoFuel: 35.08, avgTower: 0.00, record: "3-9-0", played: 12, rankingPoints: 11 },
  { rank: 64, teamNumber: 9416, rankingScore: 0.83, avgMatch: 204.00, avgAutoFuel: 46.83, avgTower: 4.17, record: "2-10-0", played: 12, rankingPoints: 10 },
  { rank: 65, teamNumber: 10949, rankingScore: 0.83, avgMatch: 190.58, avgAutoFuel: 37.83, avgTower: 1.67, record: "2-10-0", played: 12, rankingPoints: 10 },
  { rank: 66, teamNumber: 2554, rankingScore: 0.83, avgMatch: 171.67, avgAutoFuel: 39.00, avgTower: 2.92, record: "2-10-0", played: 12, rankingPoints: 10 }
];

const teamByNumber = new Map(allFmaTeams.map((item) => [item.number, item]));

export const teams: Team[] = fmaDcmpRankings.map((ranking) => {
  const base = teamByNumber.get(ranking.teamNumber) ?? team(ranking.teamNumber, `Team ${ranking.teamNumber}`, "Unknown", "Unknown");
  const strengths = [
    ranking.rank <= 16 ? "championship top-tier ranking" : ranking.rank <= 33 ? "playoff bubble profile" : "event data available",
    ranking.avgAutoFuel >= 60 ? "strong auto fuel output" : "auto fuel needs scout verification",
    ranking.avgTower >= 3 ? "notable Tower contribution" : "Tower role needs confirmation"
  ];
  const weaknesses = [
    ranking.rank > 48 ? "lower qualification ranking" : "verify role fit with live scouting",
    ranking.avgTower === 0 ? "no recorded Tower average" : "Tower timing should be validated"
  ];

  return {
    ...base,
    strengths,
    weaknesses,
    strategyNotes: `FMA DCMP rank ${ranking.rank}/66, ${ranking.record}, ${ranking.rankingPoints} RP. Avg match ${ranking.avgMatch}, avg auto fuel ${ranking.avgAutoFuel}, avg Tower ${ranking.avgTower}. OPR ${fmaDcmpOpr[ranking.teamNumber] ?? "not imported"}.`,
    eventStats: {
      rank: ranking.rank,
      rankingScore: ranking.rankingScore,
      avgMatch: ranking.avgMatch,
      avgAutoFuel: ranking.avgAutoFuel,
      avgTower: ranking.avgTower,
      record: ranking.record,
      played: ranking.played,
      rankingPoints: ranking.rankingPoints,
      opr: fmaDcmpOpr[ranking.teamNumber]
    }
  };
});

export const matches: Match[] = [
  { id: "qm1", number: 1, time: "2026-04-15T09:10:00-04:00", red: [316, 2539, 484], blue: [1403, 3314, 341], redScore: 152, blueScore: 146 },
  { id: "qm2", number: 2, time: "2026-04-15T09:22:00-04:00", red: [1676, 8513, 5895], blue: [11, 9094, 1089], redScore: 143, blueScore: 138 },
  { id: "qm3", number: 3, time: "2026-04-15T09:34:00-04:00", red: [1640, 272, 5401], blue: [103, 3637, 1218], redScore: 133, blueScore: 129 },
  { id: "qm4", number: 4, time: "2026-04-15T09:46:00-04:00", red: [1391, 5438, 555], blue: [193, 75, 6921], redScore: 118, blueScore: 112 },
  { id: "qm5", number: 5, time: "2026-04-15T09:58:00-04:00", red: [11, 316, 341], blue: [2539, 484, 1676] }
];

const entry = (matchNumber: number, teamNumber: number, alliance: "red" | "blue", auto: [number, number], tele: [number, number], climb: string, defense: number, skill: number, cycles: number[], flags: Partial<MatchScoutEntry> = {}): MatchScoutEntry => ({
  id: `m${matchNumber}-${teamNumber}`,
  eventId: event.id,
  matchId: `qm${matchNumber}`,
  matchNumber,
  teamNumber,
  alliance,
  station: `${alliance.toUpperCase()} ${((matchNumber + teamNumber) % 3) + 1}`,
  scoutName: ["Avery", "Sam", "Jordan", "Riley"][teamNumber % 4],
  autoFuelMade: auto[0],
  autoFuelAttempted: auto[1],
  teleFuelMade: tele[0],
  teleFuelAttempted: tele[1],
  intakeSource: teamNumber % 2 ? "Ground" : "Both",
  cycleTimes: cycles,
  towerClimbLevel: climb,
  climbSuccess: climb !== "None" && climb !== "Park",
  defenseRating: defense,
  driverSkill: skill,
  penalties: 0,
  fouls: teamNumber === 2590 ? 1 : 0,
  disabled: false,
  tipped: false,
  connectionIssues: false,
  breakdowns: "",
  quickNotes: skill >= 5 ? ["Fast cycles", "Great driver"] : defense >= 4 ? ["Strong defense"] : ["Clean intake"],
  notes: "",
  createdAt: new Date().toISOString(),
  synced: true,
  ...flags
});

const climbLevelFor = (avgTower: number) => {
  if (avgTower >= 10) return "Traversal Tower";
  if (avgTower >= 3) return "High Tower";
  if (avgTower >= 1) return "Mid Tower";
  return "Park";
};

const rankingEntry = (ranking: FmaDcmpRanking, rankIndex: number, sample: number) => {
  const matchNumber = rankIndex * 3 + sample + 1;
  const autoMade = Math.max(1, Math.round(ranking.avgAutoFuel / 8) + sample - 1);
  const teleMade = Math.max(6, Math.round((ranking.avgMatch - ranking.avgAutoFuel) / 12) + (2 - sample));
  const defense = Math.max(1, Math.min(5, 6 - Math.ceil(ranking.rank / 16)));
  const driverSkill = Math.max(2, Math.min(5, 6 - Math.ceil(ranking.rank / 18)));
  const cycleBase = Math.max(12, Math.round(30 - ranking.avgMatch / 24));
  const alliance = (rankIndex + sample) % 2 === 0 ? "red" : "blue";

  return entry(
    matchNumber,
    ranking.teamNumber,
    alliance,
    [autoMade, autoMade + 2],
    [teleMade, teleMade + 5],
    climbLevelFor(ranking.avgTower),
    defense,
    driverSkill,
    [cycleBase, cycleBase + 1, cycleBase + 2, cycleBase + sample],
    {
      id: `dcmp-${ranking.teamNumber}-${sample + 1}`,
      matchId: `dcmp-qm-${matchNumber}`,
      fouls: ranking.rank > 50 && sample === 1 ? 1 : 0,
      quickNotes: [
        ranking.rank <= 16 ? "DCMP top 16" : ranking.rank <= 33 ? "Playoff bubble" : "Needs validation",
        ranking.avgTower >= 3 ? "Tower points" : "Tower unknown"
      ],
      notes: `Generated baseline from TBA FMA DCMP ranking row: rank ${ranking.rank}, ${ranking.record}, avg match ${ranking.avgMatch}.`
    }
  );
};

export const matchEntries: MatchScoutEntry[] = fmaDcmpRankings.flatMap((ranking, index) => [0, 1, 2].map((sample) => rankingEntry(ranking, index, sample)));

export const pitEntries: PitScoutEntry[] = teams.map((team, index) => ({
  id: `pit-${team.number}`,
  eventId: event.id,
  teamNumber: team.number,
  scoutName: ["Morgan", "Taylor", "Casey"][index % 3],
  drivetrain: index % 3 === 0 ? "Swerve" : index % 3 === 1 ? "West Coast" : "Tank",
  weightLbs: 110 + (index % 5) * 4,
  frameLengthIn: 28,
  frameWidthIn: 28 + (index % 2) * 2,
  mechanisms: index % 2 ? ["over-bumper intake", "adjustable shooter", "single-stage climb"] : ["wide intake", "fixed hub shooter", "double-stage climb"],
  climbAbility: defaultGameConfig.scoringFields.climb.levels[2 + (index % 4)],
  scoringLevels: ["Hub close", "Hub far", "Auto preload"],
  autoPaths: index % 2 ? ["taxi + 5 fuel", "center pickup"] : ["taxi + 3 fuel", "source side pickup"],
  driveTeamComments: "Initial FMA profile imported from regional team list. Replace with pit interview notes at the event.",
  reliability: 3 + (index % 3),
  repairNotes: "No event-specific repair notes yet.",
  archetypes: index % 4 === 0 ? ["scorer", "climber"] : index % 4 === 1 ? ["hybrid"] : index % 4 === 2 ? ["defender", "support bot"] : ["scorer"],
  photos: [],
  createdAt: new Date().toISOString()
}));
