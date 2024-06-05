import prisma from "@/db";
import { createReadStream } from "fs";
import { createInterface } from "readline";
import convert from "xml-js";

export async function GET() {
  // Strings are too short for gigantic XMLs
  let data = [];

  const fileStream = createReadStream(`${process.cwd().replace(/\\/g, "/")}/public/feed.xml`);

  const lineReader = createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  for await (const line of lineReader) {
    data.push(line.trim());
  }

  // Before inserting, remove category names and product titles to avoid duplicates
  await prisma.categoryName.deleteMany({});
  //await prisma.productTitle.deleteMany({});

  // Here we will clear it up, divide it into smaller parts

  // Aliases
  for (const alias of convert.xml2js(data.slice(data.indexOf("<aliases>"), data.indexOf("</aliases>") + 1), {
    compact: true,
    spaces: 2,
  }).aliases.alias) {
    await prisma.alias.upsert({
      where: {
        id: parseInt(alias._attributes.id),
      },
      update: {
        name: alias._attributes.name,
      },
      create: {
        id: parseInt(alias._attributes.id),
        name: alias._attributes.name,
      },
    });
  }

  console.log("Finished inserting aliases.");

  // Categories
  // the category has id, may have a parent or an alias it belongs to

  // ! I have to fix category names getting duplicated.
  console.log("Starting inserting categories...");
  for (const category of convert.xml2js(data.slice(data.indexOf("<categories>"), data.indexOf("</categories>") + 1), {
    compact: true,
    spaces: 2,
  }).categories.category) {
    await prisma.category.upsert({
      where: {
        id: parseInt(category._attributes.id),
      },
      update: {
        alias: parseInt(category._attributes.alias),
        parent: parseInt(category._attributes.parent),
        names: {
          create: category.name.map(({ _attributes, _cdata }) => {
            return {
              lang: _attributes.lang,
              text: _cdata,
            };
          }),
        },
      },
      create: {
        id: parseInt(category._attributes.id),
        alias: parseInt(category._attributes.alias),
        parent: parseInt(category._attributes.parent),
        names: {
          create: category.name.map(({ _attributes, _cdata }) => {
            return {
              lang: _attributes.lang,
              text: _cdata,
            };
          }),
        },
      },
    });
    //console.log(`- Inserted category (id: ${category._attributes.id})`);
  }
  console.log("Finished inserting categories.\n");

  //console.log("Categories: ", categories);

  // TODO: profile_fields_choices, tags, tariff_strategies, comparers, producers, products

  const profiles = convert
    .xml2js(data.slice(data.indexOf("<profiles>"), data.indexOf("</profiles>") + 1), {
      compact: true,
      spaces: 2,
    })
    .profiles.profile.map(({ _attributes, name }) => {
      return {
        id: _attributes.id,
        name: name.map(({ _attributes, _cdata }) => {
          return {
            lang: _attributes.lang,
            text: _cdata,
          };
        }),
      };
    });

  //console.log("Profiles: ", profiles);

  const profile_fields = convert
    .xml2js(data.slice(data.indexOf("<profile_fields>"), data.indexOf("</profile_fields>") + 1), {
      compact: true,
      spaces: 2,
    })
    .profile_fields.field.map(({ _attributes, name }) => {
      return {
        id: _attributes.id,
        profile: _attributes.profile,
        type: _attributes.multiple_choice,
        name: name.map(({ _attributes, _cdata }) => {
          return {
            lang: _attributes.lang,
            text: _cdata,
          };
        }),
      };
    });

  //console.log("Profile fields: ", profile_fields);

  const profile_fields_choices = convert
    .xml2js(data.slice(data.indexOf("<profile_fields_choices>"), data.indexOf("</profile_fields_choices>") + 1), {
      compact: true,
      spaces: 2,
    })
    .profile_fields_choices.choice.map(({ _attributes, name }) => {
      return {
        id: _attributes.id,
        field: _attributes.field,
        ordering: _attributes.ordering,
        name: name?.map(({ _attributes, _cdata }) => {
          return {
            lang: _attributes.lang,
            text: _cdata,
          };
        }),
      };
    });

  const tags = convert
    .xml2js(data.slice(data.indexOf("<tags>"), data.indexOf("</tags>") + 1), {
      compact: true,
      spaces: 2,
    })
    .tags.tag.map(({ _attributes, name }) => {
      return {
        id: _attributes.id,
        name: name?.map(({ _attributes, _cdata }) => {
          return {
            lang: _attributes.lang,
            text: _cdata,
          };
        }),
      };
    });

  const strategies = convert
    .xml2js(data.slice(data.indexOf("<tariff_strategies>"), data.indexOf("</tariff_strategies>") + 1), {
      compact: true,
      spaces: 2,
    })
    .tariff_strategies.strategy.map((s) => {
      let code = "pl";
      switch (s._attributes.name.slice(10).trim()) {
        case "Wielka Brytania":
          code = "en";
          break;
        case "Niemcy":
          code = "de";
          break;
        case "Rosja":
          code = "ru";
          break;
        case "Czechy":
          code = "cz";
          break;
        case "Francja":
          code = "fr";
          break;
        case "Litwa":
          code = "lt";
          break;
        case "Rumunia":
          code = "ro";
          break;
        case "Słowacja":
          code = "sk";
          break;
        case "Węgry":
          code = "hu";
          break;
        case "Włochy":
          code = "it";
          break;
        case "Bułgaria":
          code = "bg";
          break;
        case "Ukraina":
          code = "uk";
          break;
        case "Hiszpania":
          code = "es";
          break;
        case "Chorwacja":
          code = "hr";
          break;
        case "Holandia":
          code = "nl";
          break;
        case "Czarnogóra":
          code = "me";
          break;
        case "Belgia":
          code = "be";
          break;
        case "Austria":
          code = "at";
          break;
        case "Serbia":
          code = "xs";
          break;
        case "Irlandia":
          code = "ie";
          break;
        case "Słowenia":
          code = "si";
          break;
        case "Estonia":
          code = "ee";
          break;
        case "Łotwa":
          code = "lv";
          break;
        case "Portugalia":
          code = "pt";
          break;
        case "Finlandia":
          code = "fi";
          break;
        case "Grecja":
          code = "gr";
          break;
      }
      return {
        name: code,
        currency: s._attributes.currency,
      };
    });

  console.log("Strategies: ", strategies);

  const comparers = convert
    .xml2js(data.slice(data.indexOf("<comparers>"), data.indexOf("</comparers>") + 1), {
      compact: true,
      spaces: 2,
    })
    .comparers.comparer.map(({ _attributes }) => {
      return {
        id: _attributes.id,
        name: _attributes.name,
      };
    });

  for (const producer of convert.xml2js(data.slice(data.indexOf("<producers>"), data.indexOf("</producers>") + 1), {
    compact: true,
    spaces: 2,
  }).producers.producer) {
    await prisma.brand.upsert({
      where: { id: parseInt(producer._attributes.id) },
      update: {
        name: producer._attributes.name,
      },
      create: {
        id: parseInt(producer._attributes.id),
        name: producer._attributes.name,
      },
    });
  }

  // products by themselves are too long
  // I will have to save them to Postgres one by one...

  console.log("Starting inserting products...");

  // why do I have to do this
  const endIndexes = data.slice(0, data.indexOf("</products>")).reduce(function (a, e, i) {
    if (e === "</product>") {
      a.push(i);
    }
    return a;
  }, []);

  let start = data.indexOf("<products>") + 1;

  for (const i of endIndexes) {
    const { p } = convert.xml2js(`<p>${data.slice(start, i + 1)}</p>`, { compact: true, spaces: 2 });

    const product = p.product;

    // Optimizing the memory usage
    delete product._text;
    delete product.descriptions;

    // I have to get tariff_strategies sorted out if I want to add product price...
    //console.log("id: ", product._attributes.id);

    // the problem is that there can be either multiple variants, or just one
    // and for some stupid reason if there is only one, it is returned as object
    // so I will just force it to be an array to save time (and code)
    if (!Array.isArray(product.variants.variant)) {
      product.variants.variant = [product.variants.variant];
    }

    // Go over every single variant...
    for (const v of product.variants.variant) {
      //console.log("Variant id: ", v._attributes.id);
      await prisma.product.upsert({
        where: {
          variantId: parseInt(v._attributes.id),
        },
        update: {
          productId: parseInt(product._attributes.id),
          active: v._attributes.isActive === "true",
          weight: parseFloat(product._attributes.weight),
          brandId: parseInt(product._attributes.producer),
          variantId: parseInt(v._attributes.id),
          sku: v._attributes.symbol,
          ean: v._attributes.ean,
          freeTransport: product._attributes.freeTransport === "true",
          productTitle: {
            create: await Promise.all(
              product.titles.title.map(async (title) => {
                // TODO: get the prices done
                let newPrice = 0;
                if (typeof product.basePrice.price !== "undefined") {
                  //console.log("base prices: ", product.basePrice.price);
                  let prices = product.basePrice.price;
                  if (!Array.isArray(prices)) {
                    prices = [prices];
                  }
                  for (const price of prices) {
                    //console.log(strategies[parseInt(price._attributes.tariff_strategy) - 1], title._attributes.lang);
                    if (typeof strategies[parseInt(price._attributes.tariff_strategy) - 1] !== "undefined") {
                      if (strategies[parseInt(price._attributes.tariff_strategy) - 1].name == title._attributes.lang) {
                        //console.log("Match!");
                        newPrice = parseFloat(price._attributes.gross);
                      }
                    }
                  }
                }
                const previousPrice = await prisma.productTitle.findFirst({
                  where: {
                    productId: parseInt(product._attributes.id),
                    name: title._cdata,
                    lang: title._attributes.lang,
                  },
                  select: {
                    newPrice: true,
                  },
                });

                return {
                  name: title._cdata,
                  lang: title._attributes.lang,
                  newPrice: newPrice,
                  oldPrice: previousPrice !== null ? previousPrice.newPrice : 0,
                  priceDifference: 0,
                };
              })
            ),
          },
        },
        create: {
          productId: parseInt(product._attributes.id),
          active: v._attributes.isActive === "true",
          weight: parseFloat(product._attributes.weight),
          brandId: parseInt(product._attributes.producer),
          variantId: parseInt(v._attributes.id),
          sku: v._attributes.symbol,
          ean: v._attributes.ean,
          freeTransport: product._attributes.freeTransport === "true",
          productTitle: {
            create: await Promise.all(
              product.titles.title.map(async (title) => {
                let newPrice = 0;
                if (typeof product.basePrice.price !== "undefined") {
                  //console.log("base prices: ", product.basePrice.price);
                  let prices = product.basePrice.price;
                  if (!Array.isArray(prices)) {
                    prices = [prices];
                  }
                  for (const price of prices) {
                    //console.log(strategies[parseInt(price._attributes.tariff_strategy) - 1], title._attributes.lang);
                    if (typeof strategies[parseInt(price._attributes.tariff_strategy) - 1] !== "undefined") {
                      if (strategies[parseInt(price._attributes.tariff_strategy) - 1].name == title._attributes.lang) {
                        //console.log("Match!");
                        newPrice = parseFloat(price._attributes.gross);
                      }
                    }
                  }
                }
                const previousPrice = await prisma.productTitle.findFirst({
                  where: {
                    productId: parseInt(product._attributes.id),
                    name: title._cdata,
                    lang: title._attributes.lang,
                  },
                  select: {
                    newPrice: true,
                  },
                });

                return {
                  name: title._cdata,
                  lang: title._attributes.lang,
                  newPrice: newPrice,
                  oldPrice: previousPrice !== null ? previousPrice.newPrice : 0,
                  priceDifference: 0,
                };
              })
            ),
          },
        },
      });
    }
    //console.log(`Inserted product (id: ${product._attributes.id})`);

    start = i + 1;
  }

  /*
    const stockTotal = convert
      .xml2js(data.slice(data.indexOf("<stockTotal>"), data.indexOf("</stockTotal>") + 1), {
        compact: true,
        spaces: 2,
      })
      .stockTotal.stock.map(({ _attributes }) => {
        return {
          alias: _attributes.alias,
          quantity: _attributes.quantity,
        };
      });

    const titles = convert
      .xml2js(data.slice(data.indexOf("<titles>"), data.indexOf("</titles>") + 1), {
        compact: true,
        spaces: 2,
      })
      .titles.title.map(({ _attributes, _cdata }) => {
        return {
          lang: _attributes.lang,
          text: _cdata,
        };
      });

    const descriptions = convert
      .xml2js(data.slice(data.indexOf("<descriptions>"), data.indexOf("</descriptions>") + 1), {
        compact: true,
        spaces: 2,
      })
      .descriptions.description.map(({ _attributes, _cdata }) => {
        return {
          alias: _attributes.alias,
          lang: _attributes.lang,
          text: _cdata,
        };
      });

    const urls = convert
      .xml2js(data.slice(data.indexOf("<urls>"), data.indexOf("</urls>") + 1), {
        compact: true,
        spaces: 2,
      })
      .urls.url.map(({ _attributes, _cdata }) => {
        return {
          alias: _attributes.alias,
          lang: _attributes.lang,
          text: _cdata,
        };
      });

    const images = convert
      .xml2js(data.slice(data.indexOf("<images>"), data.indexOf("</images>") + 1), {
        compact: true,
        spaces: 2,
      })
      .images.image.map(({ _attributes }) => {
        return {
          ordering: _attributes.ordering,
          url: _attributes.url,
        };
      });
*/
  /*
    const variants = convert
      .xml2js(data.slice(data.indexOf("<variants>"), data.indexOf("</variants>") + 1), {
        compact: true,
        spaces: 2,
      })
      .variants.variant.map(({ _attributes, optionName, stockTotal, basePrice, sellPrice }) => {
        return {
          id: _attributes.id,
          symbol: _attributes.symbol,
          ean: _attributes.ean,
          isActive: _attributes.isActive,
          optionName: optionName?.map(({ _attributes, _cdata }) => {
            return {
              lang: _attributes.lang,
              text: _cdata,
            };
          }),
          stockTotal: stockTotal.map(({ stock }) => {
            return {
              alias: _attributes.alias,
              quantity: _attributes.quantity,
            };
          }),
          basePrice: basePrice,
          sellPrice: sellPrice,
        };
      });
      */
  //console.log(variants);

  return Response.json({ data: [] });
}

