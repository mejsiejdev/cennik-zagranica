import { config } from "@/config/config";
import prisma from "@/db";
import { sendEmail } from "@/lib/email";
import { country } from "@/lib/utils";
import { render } from "@react-email/render";
import template from "@/email/EmailTemplate";

const getChangedPrices = (client) => {
  return new Promise(async (resolve, reject) => {
    const products = await prisma.product.findMany({
      include: {
        productTitle: {
          where: {
            lang: client.lang,
          },
        },
      },
    });
    const productsToSend = products
      .map((product) => {
        if (product.productTitle.length === 0) return;
        if (product.productTitle[0].priceDifference === 0) return;
        if (product.productTitle[0].sent) return;
        const { sku, ean, variantId } = product;
        return { sku, ean, variantId, priceId: product.productTitle[0].id, newPrice: product.productTitle[0].newPrice };
      })
      .filter(Boolean);
    if (productsToSend.length === 0) {
      reject("No products to send");
    } else {
      resolve({ productsToSend, client });
    }
  });
};

const sendNotification = ({ productsToSend, client }) => {
  return new Promise(async (resolve) => {
    const message = await sendEmail({
      to: client.email,
      subject: `${config.mailing.subject} ${country(client.lang)}`,
      html: render(template(productsToSend, client.lang)),
    });
    resolve({ messageTo: message, client, products: productsToSend });
  });
};

const setIsSent = (client, products) => {
  return new Promise(async (resolve, reject) => {
    for (const product of products) {
      const productPrice = await prisma.productTitle.findUnique({
        where: {
          id: product.priceId,
        },
      });
      if (productPrice.sent) {
        reject("notification already set");
      } else {
        await prisma.productTitle.update({
          where: { id: product.priceId },
          data: {
            sent: true,
          },
        });
      }
      resolve("notification created");
    }
  });
};

export const notifyClient = async () => {
  for (const mail of config.mailing.clients) {
    const sentProducts = await getChangedPrices(mail)
      .then((data) => sendNotification(data))
      .catch((e) => console.log(e));
    await setIsSent(sentProducts.client, sentProducts.products);
  }
};
