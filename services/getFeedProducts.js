import axios from "axios";
import xml2js from "xml2js";
import Bottleneck from "bottleneck";

const parserXML = new xml2js.Parser();

const limiter = new Bottleneck({
  minTime: 250,
  maxConcurrent: 10,
});

axios.interceptors.response.use(undefined, (err) => {
  const { config, message } = err;
  if (!config || !config.retry) {
    return Promise.reject(err);
  }
  if (!(message.includes("timeout") || message.includes("Network Error"))) {
    return Promise.reject(err);
  }
  config.retry -= 1;
  const delayRetryRequest = new Promise((resolve) => {
    setTimeout(() => {
      console.log("retry the request", config.url);
      resolve();
    }, config.retryDelay || 1000);
  });
  return delayRetryRequest.then(() => axios(config));
});

const fetchProductData = (source, lang, url) => {
  return new Promise(async (resolve, reject) => {
    try {
      await limiter.schedule(() => {
        return axios
          .get(url, {
            retry: 4,
            retryDelay: 3000,
          })
          .then((res) => resolve({ source, lang, data: res.data }));
      });
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
