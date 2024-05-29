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
    console.log(`- Inserted category (id: ${category._attributes.id}, text: ${category.name.map(({ _cdata }) => _cdata)})`);
  }
  console.log("Finished inserting categories.");

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

  const tariff_strategies = convert
    .xml2js(data.slice(data.indexOf("<tariff_strategies>"), data.indexOf("</tariff_strategies>") + 1), {
      compact: true,
      spaces: 2,
    })
    .tariff_strategies.strategy.map(({ _attributes }) => {
      return {
        id: _attributes.id,
        name: _attributes.name,
        currency: _attributes.currency,
      };
    });

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

  const producers = convert
    .xml2js(data.slice(data.indexOf("<producers>"), data.indexOf("</producers>") + 1), {
      compact: true,
      spaces: 2,
    })
    .producers.producer.map(({ _attributes }) => {
      return {
        id: _attributes.id,
        name: _attributes.name,
      };
    });

  // products by themselves are too long
  // I will have to save them to Postgres one by one...

  // why do I have to do this
  const endIndexes = data.slice(0, data.indexOf("</products>")).reduce(function (a, e, i) {
    if (e === "</product>") {
      a.push(i);
    }
    return a;
  }, []);

  let start = data.indexOf("<products>") + 1;

  endIndexes.forEach((i) => {
    const { product } = convert.xml2js(data.slice(start, i + 1), { compact: true, spaces: 2 });
    delete product._text;
    //console.log(product.stockTotal);
    //console.log(product.titles);

    start = i + 1;
  });

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

