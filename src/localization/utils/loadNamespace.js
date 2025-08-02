import i18n from "i18next";

export const loadNamespace = async (feature, lang) => {
  try {
    const translations = await import(`./locale/${lang}/${feature}/.json`);
    const keyExists = i18n.hasResourceBundle(lang, feature);
    if (!keyExists) {
      i18n.addResourceBundle(
        lang,
        feature,
        translations.default || translations,
        true,
        true
      );
    }

    if (!i18n.hasLoadedNamespace(feature)) {
      await i18n.loadNamespaces(feature);
    }
  } catch (error) {
    console.warn(`Translation for ${feature}/${lang} not found`, error);
  }
};
