import { NextResponse } from "next/server";
import { getProducts } from "@/services/getProducts";

export async function GET() {
  await getProducts();
  return NextResponse.json({ message: "no chyba działa" });
}
