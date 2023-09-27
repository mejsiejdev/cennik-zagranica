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
              sent: false,
              product: {
                connect: { id: existing.id },
              },
            },
          });
        } else {
          if (existingPrice[0].newPrice !== price) {
            await prisma.productTitle.update({
              where: {
                id: existingPrice[0].id,
              },
              data: {
                newPrice: price,
                oldPrice: existingPrice[0].newPrice,
                priceDifference: existingPrice[0].newPrice - price,
                differenceAt: new Date(),
                sent: false,
              },
            });
          } else {
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
                sent: false,
              },
            },
          },
        });
      }
    }
    resolve(`Zaktualizowano produkty - ${data[0].lang}`);
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
    if (products.length === 0) return resolve("Brak produktów do odznaczenia");
    for (const product of products) {
      const dayOfDifference = new Date(product.differenceAt);
      const differenceInDays = (today - dayOfDifference) / (1000 * 60 * 60 * 24);
      if (differenceInDays > 30) {
        await prisma.productTitle.update({
          where: {
            id: product.id,
          },
          data: {
            oldPrice: product.newPrice,
            priceDifference: 0,
            differenceAt: new Date(),
            sent: false,
          },
        });
      }
    }
    resolve("Odznaczono");
  });
};

export const parseFeedData = async (url, type) => {
  const feedData = await getProducts(url, type);
  return new Promise(async (resolve, reject) => {
    if (!feedData) reject("no data");
    resolve(
      feedData.result.offers.o.map((product) => {
        return {
          lang: feedData.lang,
          variantId: parseInt(product.$.variantId),
          sku: product.attrs[0].a[2]._,
          ean: !product.attrs[0].a[1]._ ? "" : product.attrs[0].a[1]._,
          price: parseFloat(product.$.price),
          name: product.name[0],
          brand: !product.attrs[0].a[0]._ ? "" : product.attrs[0].a[0]._,
        };
      })
    );
  }).then((data) =>
    setDataToDb(data).then((info) => {
      console.log(info);
      uncheckOldPriceDifferences((info2) => console.log(info2));
    })
  );
};

export const test = async () => {
  for (const url of config.source) {
    await parseFeedData(url, config.type.catalog);
  }
};
