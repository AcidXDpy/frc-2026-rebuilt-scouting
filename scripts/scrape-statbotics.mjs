import fs from "node:fs/promises";
import path from "node:path";

const eventKey = process.argv[2] ?? "2026mrcmp";
const outDir = path.join(process.cwd(), "data", "imports", eventKey);
const endpoints = {
  event: `https://api.statbotics.io/v3/event/${eventKey}`,
  teamEvents: `https://api.statbotics.io/v3/team_events?event=${eventKey}&limit=100`,
  matches: `https://api.statbotics.io/v3/matches?event=${eventKey}&limit=200`
};

await fs.mkdir(outDir, { recursive: true });

for (const [name, url] of Object.entries(endpoints)) {
  const response = await fetch(url, { headers: { "User-Agent": "MORT-Scouting-Import/1.0" } });
  if (!response.ok) {
    console.warn(`${name}: ${response.status} ${response.statusText}`);
    continue;
  }
  const json = await response.json();
  await fs.writeFile(path.join(outDir, `${name}.json`), JSON.stringify(json, null, 2));
  console.log(`wrote ${name}.json`);
}

console.log(`Import folder: ${outDir}`);
