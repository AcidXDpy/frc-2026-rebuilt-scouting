import { NextResponse } from "next/server";
import { z } from "zod";

const entrySchema = z.object({
  eventId: z.string(),
  matchId: z.string(),
  matchNumber: z.number(),
  teamNumber: z.number(),
  scoutName: z.string(),
  autoFuelMade: z.number().min(0),
  autoFuelAttempted: z.number().min(0),
  teleFuelMade: z.number().min(0),
  teleFuelAttempted: z.number().min(0),
  towerClimbLevel: z.string(),
  climbSuccess: z.boolean()
}).passthrough().refine((entry) => entry.autoFuelMade <= entry.autoFuelAttempted && entry.teleFuelMade <= entry.teleFuelAttempted, "Makes cannot exceed attempts.");

export async function POST(request: Request) {
  const payload = await request.json();
  const parsed = entrySchema.safeParse(payload);
  if (!parsed.success) return NextResponse.json({ ok: false, errors: parsed.error.flatten() }, { status: 400 });

  return NextResponse.json({
    ok: true,
    message: "Validated scouting entry. Connect Prisma in this route to persist to Postgres/Supabase.",
    entry: parsed.data
  });
}
