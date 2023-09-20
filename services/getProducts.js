import { config } from "@/config/config";
import axios from "axios";
import xml2js from "xml2js";

export const getProducts = async () => {
  const parserXML = new xml2js.Parser();

  // const requests = config.source.toolight.map((url) => `${url}${config.type.merchant}`);

  // const requests = [];
  //
  for (const [key, value] of Object.entries(config.source.toolight)) {
    console.log(key, value);
  }

  const getProd = (lang, url) => {
    return new Promise(async (resolve, reject) => {
      try {
        await axios
          .get(url, {
            timeout: 0,
            responseType: "text",
          })
          .then((res) => resolve({ lang, data: res.data }));
      } catch (error) {
        reject(error);
      }
    });
  };

  const parseProd = (lang, data) => {
    return new Promise(async (resolve, reject) => {
      parserXML.parseString(data, async (error, result) => {
        if (error) return reject(error);
        return resolve({ lang, result });
      });
    });
  };

  const data = await getProd("en", "https://files.lazienka-rea.com.pl/fruugo.xml")
    .then((res) => parseProd(res.lang, res.data))
    .catch((error) => console.log(error));

  const urls = [
    ["en", "https://files.lazienka-rea.com.pl/fruugo.xml"],
    ["de", "https://files.lazienka-rea.com.pl/mall_cz.xml"],
    ["pl", "https://files.lazienka-rea.com.pl/mall_si.xml"],
  ];

  const requests = urls.map((url) => {
    return getProd(url[0], url[1])
      .then((res) => parseProd(res.lang, res.data))
      .catch((error) => console.log(error));
  });

  const ko = await Promise.all(requests);
  console.log(ko);
  // console.log(data);
  // console.log(requests);
  // const requestOne = axios.get(one);
  // const requestTwo = axios.get(two);
  // const requestThree = axios.get(three);
  //
  // axios
  //   .all([requestOne, requestTwo, requestThree])
  //   .then(
  //     axios.spread((...responses) => {
  //       const responseOne = responses[0];
  //       const responseTwo = responses[1];
  //       const responesThree = responses[2];
  //       // use/access the results
  //       // console.log("responseOne", responseOne.data);
  //       // console.log("responseTwo", responseTwo.data);
  //       // console.log("responesThree", responesThree.data);
  //
  //       parserXML.parseString(responseOne.data, async (error, result) => {
  //         const parsedData = result;
  //         console.log(parsedData);
  //       });
  //       parserXML.parseString(responseTwo.data, async (error, result) => {
  //         const parsedData = result;
  //         console.log(parsedData);
  //       });
  //       parserXML.parseString(responesThree.data, async (error, result) => {
  //         const parsedData = result;
  //         console.log(parsedData);
  //       });
  //     }),
  //   )
  //   .catch((errors) => {
  //     console.log(errors);
  //   });
};
