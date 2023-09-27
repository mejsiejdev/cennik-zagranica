export const parseFeedData = async (data) => {
  return new Promise(async (resolve, reject) => {
    if (!data) reject("no data");
    resolve(
      data
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
        .flat(),
    );
  });
};
