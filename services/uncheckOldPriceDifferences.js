import prisma from "@/db";

export const uncheckOldPriceDifferences = (lang) => {
  return new Promise(async (resolve) => {
    const today = new Date();
    const products = await prisma.productTitle.findMany({
      where: {
        NOT: [{ priceDifference: 0 }],
        lang,
      },
      include: {
        priceNotifications: true,
      },
    });
    console.log(products);
    if (products.length === 0) {
      console.log("Brak produktów do odznaczenia");
      return resolve("Brak produktów do odznaczenia");
    }
    for (const product of products) {
      const dayOfDifference = new Date(product.priceDifferenceAt);
      const differenceInDays = (today - dayOfDifference) / (1000 * 60 * 60 * 24);
      console.log(product);
      if (differenceInDays > 30) {
        await prisma.productTitle.update({
          where: {
            id: product.id,
          },
          data: {
            oldPrice: product.newPrice,
            priceDifference: 0,
            priceDifferenceAt: new Date(),
            priceNotifications: {
              update: {
                where: {
                  id: product.priceNotifications[0].id,
                },
                data: { isSent: false },
              },
            },
          },
        });
        console.log(`Odznaczono powiadomienie - ${lang} - ${product.id}`);
      }
    }
    resolve(`Odznaczono  powiadomienia - ${lang}`);
  });
};
