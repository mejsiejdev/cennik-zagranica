import { config } from "@/config/config";

export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import prisma from "@/db";
import { createWriteStream, createReadStream } from "fs";
import { createInterface } from "readline";
import convert from "xml-js";
import { setDataToDb } from "@/services/setProductsToDb";
import { uncheckOldPriceDifferences } from "@/services/uncheckOldPriceDifferences";
import { parseFeedData } from "@/services/parseFeedData";
import { getProducts } from "@/services/getFeedProducts";
import axios from "axios";
import { pipeline } from "stream";

import { promisify } from "util";

export async function GET() {
  /*
  const data = await getProducts(config.source, config.type.catalog);
  await parseFeedData(data)
    .then((data) => setDataToDb(data))
    .catch((e) => console.log(e));
  for (const url of config.source) {
    await uncheckOldPriceDifferences(url.lang);
  }
  */

  // Download the data
  /*
  const writer = createWriteStream("data.xml");
  await axios({ method: "GET", url: "https://lazienka-rea.com.pl/feed/generate/full_offer", responseType: "stream" }).then((response) => {
    return new Promise((resolve, object) => {
      response.data.pipe(writer);
      let error = null;
      writer.on("error", (err) => {
        error = err;
        writer.close();
        reject(err);
      });
      writer.on("close", () => {
        console.log("Downloaded");
        if (!error) {
          resolve(true);
        }
        //no need to call the reject here, as it will have been called in the
        //'error' stream;
      });
    });
  });
  */

  const p = promisify(pipeline);
  try {
    const request = await axios.get("https://lazienka-rea.com.pl/feed/generate/full_offer", {
      responseType: "stream",
    });
    await p(request.data, createWriteStream(`${process.cwd().replace(/\\/g, "/")}/public/temp/feed.xml`, { flags: "w" }));
    console.log("Download successful!");
  } catch (error) {
    console.error("Download failed.", error);
  }

  // Before inserting, remove category names and product titles to avoid duplicates
  await prisma.categoryName.deleteMany({});

  // Strings are too short for gigantic XMLs
  let data = [];

  const fileStream = createReadStream(`${process.cwd().replace(/\\/g, "/")}/public/temp/feed.xml`);

  const lineReader = createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  for await (const line of lineReader) {
    data.push(line.trim());
  }

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
  }
  console.log("Finished inserting categories.\n");

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

    let productIds = [];
    // Go over every single variant...
    for (const v of product.variants.variant) {
      //console.log("Variant id: ", v._attributes.id);
      const result = await prisma.product.upsert({
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
        },
      });
      productIds.push(result.id);
      console.log(`Inserted product (id: ${product._attributes.id}, variantId: ${v._attributes.id})`);
    }

    //console.log("Inserting product's titles...");
    await Promise.all(
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
        const currentProductData = await prisma.productTitle.findFirst({
          where: {
            products: {
              some: {
                productId: {
                  in: productIds,
                },
              },
            },
            name: title._cdata,
            lang: title._attributes.lang,
          },
          select: {
            id: true,
            newPrice: true,
          },
        });

        console.log("cpd:", currentProductData);

        if (currentProductData !== null) {
          await prisma.productTitle.update({
            where: {
              id: currentProductData.id,
            },
            data: {
              name: title._cdata,
              lang: title._attributes.lang,
              newPrice: newPrice,
              oldPrice: currentProductData.newPrice,
              priceDifference: currentProductData.newPrice !== 0 ? newPrice - currentProductData.newPrice : 0,
            },
          });
        } else {
          await prisma.productTitle.create({
            data: {
              name: title._cdata,
              lang: title._attributes.lang,
              newPrice: newPrice,
              oldPrice: 0,
              priceDifference: 0,
              products: {
                create: productIds.map((id) => {
                  return {
                    product: {
                      connect: {
                        id: id,
                      },
                    },
                  };
                }),
              },
            },
          });
        }
      })
    );

    start = i + 1;
  }

  return NextResponse.json({ message: "Zaktualizowano produkty." });
}
