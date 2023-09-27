import { notifyClient } from "@/services/sendNotification";
export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";

export async function GET() {
  await notifyClient();
  return NextResponse.json({ messageSentTo: "poszło" });
}
