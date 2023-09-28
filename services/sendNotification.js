import { config } from "@/config/config";
import prisma from "@/db";
import { sendEmail } from "@/lib/email";
import { country } from "@/lib/utils";
import { render } from "@react-email/render";
import template from "@/email/EmailTemplate";

const getChangedPrices = (clients) => {
  return new Promise(async (resolve, reject) => {
    const products = await prisma.product.findMany({
      include: {
        productTitle: {
          where: {
            lang: clients.lang,
          },
          include: {
            priceNotifications: true,
          },
        },
      },
    });
    const productsToSend = products
      .map((product) => {
        if (product.productTitle.length === 0) return;
        if (product.productTitle[0].priceDifference === 0) return;
        if (product.productTitle[0].priceNotifications[0].isSent) return;
        const { sku, ean, variantId } = product;
        return { sku, ean, variantId, priceId: product.productTitle[0].id, newPrice: product.productTitle[0].newPrice };
      })
      .filter(Boolean);
    if (productsToSend.length === 0) {
      reject("No products to send");
    } else {
      resolve({ productsToSend, clients });
    }
  });
};

const sendNotification = ({ productsToSend, clients }) => {
  return new Promise(async (resolve) => {
    for (const client of clients.emails) {
      await sendEmail({
        to: client,
        subject: `${config.mailing.subject} ${country(clients.lang)}`,
        html: render(template(productsToSend, clients.lang)),
      });
      console.log(`Wysłano powiadomienie do - ${clients.lang} - ${client}`);
    }
    resolve(productsToSend);
  });
};

const setIsSent = (products) => {
  return new Promise(async (resolve, reject) => {
    if (!products) reject("Brak produktów do ustawienia");
    for (const product of products) {
      const productTitle = await prisma.productTitle.findUnique({
        where: {
          id: product.priceId,
        },
        include: {
          priceNotifications: true,
        },
      });
      if (productTitle.priceNotifications[0].isSent) {
        reject("Powiadomienie już ustawione jako wysłane");
      } else {
        await prisma.productTitle.update({
          where: { id: product.priceId },
          data: {
            priceNotifications: {
              update: {
                where: {
                  id: productTitle.priceNotifications[0].id,
                },
                data: {
                  isSent: true,
                },
              },
            },
          },
        });
      }
      resolve("Powiadomienie ustawione jako wysłane");
    }
  });
};

export const notifyClient = async () => {
  for (const client of config.mailing.clients) {
    if (client.emails.length !== 0) {
      await getChangedPrices(client)
        .then((data) => sendNotification(data))
        .then((products) => setIsSent(products));
    }
  }
};
