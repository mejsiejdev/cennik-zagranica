export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { parseFeedData, test } from "@/services/setProductsToDb";

export async function GET() {
  await test();
  return NextResponse.json({ message: "Zaktualizowano" });
}
