import i18n from "i18next";

import pl from "locales/pl/_pl";
import en from "locales/en/_en";
import de from "locales/de/_de";

// want your translations to be loaded from a professional CDN? => https://github.com/locize/react-tutorial#step-2---use-the-locize-cdn

i18n
  // init i18next
  // for all options read: https://www.i18next.com/overview/configuration-options
  .init({
    resources: {
      // here by default i18n will search for `translation` namespace in `de` language so if you don't want to use only `translation` namespace and want to use more you have to pass more namespaces for `de` language any any other
      de,
      en,
      pl,
    },

    defaultNS: "common",

    fallbackLng: "en",

    interpolation: {
      escapeValue: false, // not needed for react as it escapes by default
    },
  });

export default i18n;
