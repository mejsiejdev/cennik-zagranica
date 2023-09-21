import { NextResponse } from "next/server";
import { getProducts } from "@/services/getFeedProducts";
import { config } from "@/config/config";
import prisma from "@/db";
import { setProductsToDb } from "@/services/setProductsToDb";

export async function GET() {
  const test = await setProductsToDb();
  const data = await prisma.product.findMany({
    include: {
      ProductTitle: true,
    },
  });
  return NextResponse.json({ test });
}
