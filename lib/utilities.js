import { entities } from "./entities.js";

const decodeEntities = (encoded) => {
  const translateReplacement = /&(nbsp|amp|quot|lt|gt|mdash);/gm;
  const translate = {
    nbsp: " ",
    amp: "&",
    quot: '"',
    lt: "<",
    gt: ">",
    mdash: "-",
  };
  return encoded
    .replace(translateReplacement, function (match, entity) {
      return translate[entity];
    })
    .replace(/&#(\d+);/gm, function (match, numStr) {
      return String.fromCharCode(numStr);
    });
};

export const decodeText = (data) => {
  const fixString = data.replace(/[\r\n]/gm, "");
  return decodeEntities(fixString);
};

export const replaceEntities = (data) => {
  const toCheck = data.replace(/[\r\n]/gm, "").split(" ");
  return toCheck
    .map((check) => {
      let newWord = check;
      entities.forEach((entitie) => {
        const regex = new RegExp(entitie.entitiyName, "gm");
        if (check.match(regex)) {
          newWord = check.replace(regex, entitie.char);
        }
      });
      return newWord;
    })
    .join(" ");
};

const localeswebsite = "https://lingohub.com/developers/supported-locales/language-designators-with-regions";

export const currencyMapping = (lang) => {
  switch (lang) {
    case "pl":
      return "PLN";
    case "de":
      return "EUR";
  }
};
