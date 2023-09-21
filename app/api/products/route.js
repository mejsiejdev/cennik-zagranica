import { NextResponse } from "next/server";
import { getProducts } from "@/services/getFeedProducts";
import { config } from "@/config/config";

export async function GET() {
  const data = await getProducts(config.source, config.type.catalog);
  return NextResponse.json({ data: "gotowe" });
}
