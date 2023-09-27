import prisma from "@/db";

export const setDataToDb = (data) => {
  return new Promise(async (resolve) => {
    for (const product of data) {
      const { lang, variantId, sku, ean, price, name, brand } = product;
      const existing = await prisma.product.findUnique({
        where: {
          variantId,
        },
        include: {
          productTitle: {
            include: {
              priceNotifications: true,
            },
          },
        },
      });
      if (existing) {
        const existingPrice = await prisma.productTitle.findMany({
          where: {
            productId: existing.id,
            lang,
          },
          include: {
            priceNotifications: true,
          },
        });
        if (existingPrice.length === 0) {
          await prisma.productTitle.create({
            data: {
              name,
              lang,
              newPrice: price,
              oldPrice: price,
              priceDifference: 0,
              product: {
                connect: { id: existing.id },
              },
              priceNotifications: {
                create: {
                  isSent: false,
                  lang,
                },
              },
            },
          });
        } else {
          const existingNotification = await prisma.priceNotifications.findMany({
            where: {
              productTitleId: existingPrice[0].id,
              lang,
            },
          });
          if (existingNotification.length === 0) {
            await prisma.priceNotifications.create({
              data: {
                isSent: false,
                lang,
                productTitle: {
                  connect: {
                    id: existingPrice[0].id,
                  },
                },
              },
            });
          } else {
            await prisma.priceNotifications.update({
              where: {
                id: existingNotification[0].id,
              },
              data: {
                isSent: false,
                lang,
              },
            });
          }
          if (existingPrice[0].newPrice !== price) {
            await prisma.productTitle.update({
              where: {
                id: existingPrice[0].id,
              },
              data: {
                newPrice: price,
                oldPrice: existingPrice[0].newPrice,
                priceDifference: existingPrice[0].newPrice - price,
                priceDifferenceAt: new Date(),
                priceNotifications: {
                  update: {
                    where: {
                      id: existingNotification[0].id,
                    },
                    data: { isSent: false },
                  },
                },
              },
            });
          } else {
          }
          console.log(`Zaktualizowano produkt - ${lang} - ${existing.id}`);
        }
      } else {
        const newProduct = await prisma.product.create({
          data: {
            variantId,
            sku,
            ean,
            brand,
            productTitle: {
              create: {
                name,
                lang,
                newPrice: price,
                oldPrice: price,
                priceDifference: 0,
                priceNotifications: {
                  create: {
                    isSent: false,
                    lang,
                  },
                },
              },
            },
          },
        });
        console.log(`Dodano produkt - ${lang} - ${newProduct.id} `);
      }
    }
    resolve(`Zaktualizowano produkty - ${data[0].lang}`);
  });
};
