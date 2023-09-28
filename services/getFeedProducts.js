import axios from "axios";
import xml2js from "xml2js";

const parserXML = new xml2js.Parser();

const fetchProductData = (source, lang, url) => {
  return new Promise(async (resolve, reject) => {
    try {
      return await axios.get(url).then((res) => resolve({ source, lang, data: res.data }));
    } catch (error) {
      reject(error);
    }
  });
};

const parseProductData = (source, lang, data) => {
  return new Promise(async (resolve, reject) => {
    parserXML.parseString(data, async (error, result) => {
      if (error) return reject(error);
      return resolve({ source, lang, result });
    });
  });
};

export const getProducts = async (sources, type) => {
  const requests = sources.map((feed) => {
    return fetchProductData(feed.source, feed.lang, feed.url + type)
      .then((res) => parseProductData(res.source, res.lang, res.data))
      .catch((error) => console.log(feed.source, feed.lang, feed.url + type, error.code));
  });
  return await Promise.all(requests);
};
