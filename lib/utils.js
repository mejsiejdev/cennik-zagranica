import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { config } from "@/config/config";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const currencyMapping = (lang) => {
  switch (lang) {
    case "pl":
      return { currency: "PLN", locale: "pl-PL" };
    case "uk":
      return { currency: "GBP", locale: "en-GB" };
    case "de":
      return { currency: "EUR", locale: "de-DE" };
    case "cz":
      return { currency: "CZK", locale: "cz-CZ" };
    case "fr":
      return { currency: "EUR", locale: "fr-FR" };
    case "lt":
      return { currency: "EUR", locale: "lt-LT" };
    case "ro":
      return { currency: "RON", locale: "ro-RO" };
    case "sk":
      return { currency: "EUR", locale: "sk-SK" };
    case "hu":
      return { currency: "HUF", locale: "hu-HU" };
    case "it":
      return { currency: "EUR", locale: "it-IT" };
    case "bg":
      return { currency: "BGN", locale: "bg-BG" };
    case "ua":
      return { currency: "EUR", locale: "ua-UA" };
    case "es":
      return { currency: "EUR", locale: "es-ES" };
    case "ee":
      return { currency: "EUR", locale: "et-EE" };
    case "hr":
      return { currency: "EUR", locale: "hr-HR" };
    case "lv":
      return { currency: "EUR", locale: "lv-LV" };
    case "nl":
      return { currency: "EUR", locale: "nl-NL" };
    case "me":
      return { currency: "EUR", locale: "sr-ME" };
    case "rs":
      return { currency: "EUR", locale: "sr-RS" };
    case "be":
      return { currency: "EUR", locale: "fr-BE" };
    case "at":
      return { currency: "EUR", locale: "de-AT" };
    case "ie":
      return { currency: "EUR", locale: "en-IE" };
    case "si":
      return { currency: "EUR", locale: "si-SI" };
    default:
      return { currency: "PLN", locale: "pl-PL" };
  }
};

export const country = (lang) => {
  switch (lang) {
    case "pl":
      return "Poland";
    case "uk":
      return "England";
    case "de":
      return "Germany";
    case "cz":
      return "Czech";
    case "fr":
      return "France";
    case "lt":
      return "Lithuania";
    case "ro":
      return "Romania";
    case "sk":
      return "Slovakia";
    case "hu":
      return "Hungary";
    case "it":
      return "Italy";
    case "bg":
      return "Bulgaria";
    case "ua":
      return "Ukraine";
    case "es":
      return "Spain";
    case "ee":
      return "Estonia";
    case "hr":
      return "Croatia";
    case "lv":
      return "Latvia";
    case "nl":
      return "Netherlands";
    case "me":
      return "Montenegro";
    case "rs":
      return "Serbia";
    case "be":
      return "Belgium";
    case "at":
      return "Austria";
    case "ie":
      return "Ireland";
    case "si":
      return "Slovenia";
    default:
      return "Poland";
  }
};

export const password = (pass, lang) => {
  switch (lang) {
    case "pl":
      return pass === "Poland";
    case "uk":
      return pass === "England";
    case "de":
      return pass === "Germany";
    case "cz":
      return pass === "Czech";
    case "fr":
      return pass === "France";
    case "lt":
      return pass === "Lithuania";
    case "ro":
      return pass === "Romania";
    case "sk":
      return pass === "Slovakia";
    case "hu":
      return pass === "Hungary";
    case "it":
      return pass === "Italy";
    case "bg":
      return pass === "Bulgaria";
    case "ua":
      return pass === "Ukraine";
    case "es":
      return pass === "Spain";
    case "ee":
      return pass === "Estonia";
    case "hr":
      return pass === "Croatia";
    case "lv":
      return pass === "Latvia";
    case "nl":
      return pass === "Netherlands";
    case "me":
      return pass === "Montenegro";
    case "rs":
      return pass === "Serbia";
    case "be":
      return pass === "Belgium";
    case "at":
      return pass === "Austria";
    case "ie":
      return pass === "Ireland";
    case "si":
      return pass === "Slovenia";
  }
};

export const matchPath = (lang) => {
  return config.source.some((item) => item.lang === lang);
};
