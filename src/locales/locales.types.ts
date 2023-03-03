import en from "./en/_en";

// This file creates literal union of each namespace translation keys based on EN language which is  the default language

export type TranslationKeysAuth = keyof typeof en.auth;
export type TranslationKeysCommon = keyof typeof en.common;
export type TranslationKeysFiles = keyof typeof en.files;

export type TranslationNamespaces = keyof typeof en;
