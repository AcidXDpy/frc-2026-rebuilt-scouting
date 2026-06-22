import { NextResponse } from "next/server";

export async function GET(_: Request, { params }: { params: { key: string } }) {
  const apiKey = process.env.TBA_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ ok: false, message: "Set TBA_API_KEY to enable Blue Alliance imports." }, { status: 501 });
  }

  const response = await fetch(`https://www.thebluealliance.com/api/v3/event/${params.key}/matches/simple`, {
    headers: { "X-TBA-Auth-Key": apiKey },
    next: { revalidate: 300 }
  });

  if (!response.ok) {
    return NextResponse.json({ ok: false, message: "TBA request failed." }, { status: response.status });
  }

  return NextResponse.json({ ok: true, matches: await response.json() });
}
