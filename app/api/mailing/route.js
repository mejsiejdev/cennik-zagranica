export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";
import { render } from "@react-email/render";
import template from "@/email/EmailTemplate";
import prisma from "@/db";
import { config } from "@/config/config";
import { country } from "@/lib/utils";

export async function GET() {
  const listOfSentMessages = [];
  for (const mail of config.mailing.clients) {
    const products = await prisma.product.findMany({
      include: {
        ProductTitle: {
          where: {
            lang: mail.lang,
          },
        },
      },
    });
    const filtered = products
      .map((product) => {
        if (product.ProductTitle.length === 0) return;
        if (product.ProductTitle[0].priceDifference === 0) return;
        const { sku, ean, variantId } = product;
        return { sku, ean, variantId, newPrice: product.ProductTitle[0].newPrice };
      })
      .filter(Boolean);

    if (filtered.length !== 0) {
      const message = await sendEmail({
        to: mail.email,
        subject: `${config.mailing.subject} ${country(mail.lang)}`,
        html: render(template(filtered, mail.lang)),
      });
      listOfSentMessages.push(message);
    }
  }
  return NextResponse.json({ messageSentTo: listOfSentMessages });
}
