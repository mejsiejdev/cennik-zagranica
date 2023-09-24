export const dynamic = "force-dynamic";
import { password } from "@/lib/utils";
import { NextResponse } from "next/server";

export async function POST(request) {
  const { pass, lang } = await request.json();
  const authorized = password(pass, lang);
  return NextResponse.json({ authorized });
}
