import { createReadStream } from "fs";
import { createInterface } from "readline";
import { PassThrough } from "stream";
import convert from "xml-js";

export async function GET() {
  // Strings are too short for gigantic XMLs
  let data = [];

  const lineReader = createInterface({
    input: createReadStream(`${process.cwd().replace(/\\/g, "/")}/public/feed.xml`),
  });

  lineReader.on("line", function (line) {
    data.push(line.trim());
    //console.log("Line from file:", line);
  });

  lineReader.on("close", function () {
    console.log("all done, son");

    // Here we will clear it up, divide it into smaller parts

    const aliases = convert
      .xml2js(data.slice(data.indexOf("<aliases>"), data.indexOf("</aliases>") + 1), {
        compact: true,
        spaces: 2,
      })
      .aliases.alias.map(({ _attributes }) => {
        return { id: _attributes.id, name: _attributes.name };
      });

    //console.log("Aliases: ", aliases);

    // the category has id, may have a parent or an alias it belongs to

    const categories = convert
      .xml2js(data.slice(data.indexOf("<categories>"), data.indexOf("</categories>") + 1), {
        compact: true,
        spaces: 2,
      })
      .categories.category.map(({ _attributes, name }) => {
        return {
          id: _attributes.id,
          alias: _attributes.alias,
          parent: _attributes.parent,
          name: name.map(({ _attributes, _cdata }) => {
            return {
              lang: _attributes.lang,
              text: _cdata,
            };
          }),
        };
      });

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

    console.log("Profile fields choices: ", profile_fields_choices);

    //console.log(data.slice(data.indexOf("</profile_fields>") + 1, data.indexOf("</profile_fields>") + 100));
  });

  return Response.json({ data: [] });
  /*
  function readLines({ input }) {
    const output = new PassThrough({ objectMode: true });
    const rl = createInterface({ input });
    rl.on("line", (line) => {
      output.write(line);
    });
    rl.on("close", () => {
      console.log("done.");
      output.push(null);
    });
    return output;
  }
  const input = createReadStream(`${process.cwd().replace(/\\/g, "/")}/public/feed.xml`);
  await (async () => {
    for await (const line of readLines({ input })) {
      data.push(line);
    }
  })();
  return Response.json({ data: data.slice(0, 200) });
  */
}

