import en from "./en/_en";

// This file creates literal union of each namespace translation keys based on EN language which is  the default language

type T = typeof en;

export type TranslationNamespaces = keyof typeof en;

export type TranslationKey = {
  [Property in keyof T]: keyof T[Property];
};
