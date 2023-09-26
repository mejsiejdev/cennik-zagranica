import prisma from "@/db";
import { getProducts } from "@/services/getFeedProducts";
import { config } from "@/config/config";

const setDataToDb = (data) => {
  return new Promise(async (resolve) => {
    for (const product of data) {
      const { lang, variantId, sku, ean, price, name, brand } = product;
      const existing = await prisma.product.findUnique({
        where: {
          variantId,
        },
        include: {
          productTitle: true,
        },
      });
      if (existing) {
        const existingPrice = await prisma.productTitle.findMany({ where: { productId: existing.id, lang } });
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
            },
          });
        } else {
          if (existingPrice[0].newPrice === price) {
            await prisma.productTitle.update({
              where: {
                id: existingPrice[0].id,
              },
              data: {
                newPrice: existingPrice[0].newPrice,
                oldPrice: existingPrice[0].oldPrice,
              },
            });
          } else {
            await prisma.productTitle.update({
              where: {
                id: existingPrice[0].id,
              },
              data: {
                newPrice: price,
                oldPrice: existingPrice[0].newPrice,
                priceDifference: existingPrice[0].newPrice - price,
                differenceAt: new Date(),
              },
            });
          }
        }
      } else {
        await prisma.product.create({
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
              },
            },
          },
        });
      }
    }
    resolve(`Gotowe`);
  });
};

const uncheckOldPriceDifferences = () => {
  return new Promise(async (resolve) => {
    const today = new Date();
    const products = await prisma.productTitle.findMany({
      where: {
        NOT: [{ priceDifference: 0 }],
      },
    });
    for (const product of products) {
      const date2 = new Date(product.differenceAt);
      const diffDays = parseInt((today - date2) / (1000 * 60 * 60 * 24), 10);
      if (diffDays > 30) {
        await prisma.productTitle.update({
          where: {
            id: product.id,
          },
          data: {
            oldPrice: product.newPrice,
            priceDifference: 0,
            differenceAt: new Date(),
          },
        });
      }
    }
    resolve("odznaczone");
  });
};

export const parseFeedData = async () => {
  const feedData = await getProducts(config.source, config.type.catalog);
  return new Promise(async (resolve) => {
    resolve(
      feedData
        .filter(Boolean)
        .map((data) => {
          if (!data) return;
          const products = data.result.offers.o.map((product) => {
            return {
              lang: data.lang,
              variantId: parseInt(product.$.variantId),
              sku: product.attrs[0].a[2]._,
              ean: !product.attrs[0].a[1]._ ? "" : product.attrs[0].a[1]._,
              price: parseFloat(product.$.price),
              name: product.name[0],
              brand: !product.attrs[0].a[0]._ ? "" : product.attrs[0].a[0]._,
            };
          });
          return [...products];
        })
        .flat()
    );
  }).then((data) =>
    setDataToDb(data).then((info) => {
      uncheckOldPriceDifferences();
      console.log(info);
    })
  );
};
