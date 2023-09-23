import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";
import { render } from "@react-email/render";
import template from "@/email/template";

export async function GET(request) {
  const lang = request.nextUrl.searchParams.get("lang");
  const products = await prisma.product.findMany({
    include: {
      ProductTitle: {
        where: {
          lang,
        },
      },
    },
  });
  const filtered = products
    .map((product) => {
      const { sku, ean, variantId } = product;
      return { sku, ean, variantId, ...product.ProductTitle[0] };
    })
    .filter((diff) => {
      const { newPrice, oldPrice } = diff;
      const difference = parseFloat(newPrice) - parseFloat(oldPrice);
      if (difference !== 0) return diff;
    });
  await sendEmail({
    to: "drteski@gmail.com",
    subject: "Welcome to NextAPI",
    html: render(template(filtered, lang)),
  });
  return NextResponse.json("sent");
}
