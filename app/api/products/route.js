import { NextResponse } from "next/server";
import { parseFeedData } from "@/services/setProductsToDb";

export async function GET() {
  await parseFeedData();
  return NextResponse.json({ message: "Zaktualizowano" });
}
