import { config } from "@/config/config";

export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { setDataToDb } from "@/services/setProductsToDb";
import { uncheckOldPriceDifferences } from "@/services/uncheckOldPriceDifferences";
import { parseFeedData } from "@/services/parseFeedData";
import { getProducts } from "@/services/getFeedProducts";

export async function GET() {
  const data = await getProducts(config.source, config.type.catalog);
  await parseFeedData(data)
    .then((data) => setDataToDb(data))
    .catch((e) => console.log(e));
  for (const url of config.source) {
    await uncheckOldPriceDifferences(url.lang);
  }

  return NextResponse.json({ message: "Zaktualizowano" });
}
