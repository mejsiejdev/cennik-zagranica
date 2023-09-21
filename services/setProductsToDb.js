import prisma from "@/db";
import { getProducts } from "@/services/getFeedProducts";
import { config } from "@/config/config";

export const setProductsToDb = async () => {
  const feedData = await getProducts(config.source, config.type.catalog);
  const parsedFeedData = feedData
    .map((data) => {
      const products = data.result.offers.o.map((product) => {
        return {
          lang: data.lang,
          variantId: parseInt(product.$.variantId),
          sku: product.attrs[0].a[2]._,
          ean: !product.attrs[0].a[1]._ ? "" : product.attrs[0].a[1]._,
          price: product.$.price,
          name: product.name[0],
          brand: product.attrs[0].a[0]._,
        };
      });
      return [...products];
    })
    .flat();

  const testProducts = [
    { lang: "pl", variantId: 25391, sku: "OSW-00011", ean: "5902557333646", price: "39", name: "Lampa Reno 180986", brand: "Toolight" },
    { lang: "de", variantId: 25391, sku: "OSW-00011", ean: "5902557333646", price: "8", name: "Lampe Reno 180986", brand: "Toolight" },
  ];

  return parsedFeedData;
  // for await (const product of parsedFeedData) {
  //   const { lang, variantId, sku, ean, price, name, brand } = product;
  //   const existing = await prisma.product.findUnique({
  //     where: {
  //       variantId,
  //     },
  //     include: {
  //       ProductTitle: {
  //         where: {
  //           lang,
  //         },
  //       },
  //     },
  //   });
  //   const existingPrice = await prisma.productTitle.findMany({ where: { productId: existing.id, lang } });
  //   if (!existing) {
  //     await prisma.product.create({
  //       data: {
  //         variantId,
  //         sku,
  //         ean,
  //         brand,
  //         ProductTitle: {
  //           create: {
  //             name,
  //             lang,
  //             newPrice: price,
  //             oldPrice: price,
  //           },
  //         },
  //       },
  //     });
  //     return;
  //   }
  //   if (existingPrice.length === 0) {
  //     await prisma.productTitle.create({
  //       data: {
  //         name,
  //         lang,
  //         newPrice: price,
  //         oldPrice: price,
  //         product: {
  //           connect: { id: existing.id },
  //         },
  //       },
  //     });
  //     return;
  //   }
  //   await prisma.productTitle.update({
  //     where: {
  //       id: existingPrice[0].id,
  //     },
  //     data: {
  //       newPrice: price,
  //       oldPrice: existingPrice[0].newPrice,
  //     },
  //   });
  // }
};
