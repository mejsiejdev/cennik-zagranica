import { NextResponse } from "next/server";
import { getProducts } from "@/services/getFeedProducts";
import { config } from "@/config/config";
import prisma from "@/db";
import { parseFeedData } from "@/services/setProductsToDb";

export async function GET() {
  const test = await parseFeedData();
  const data = await prisma.product.findMany({
    include: {
      ProductTitle: {},
    },
  });
  return NextResponse.json({ data });
}
2;
