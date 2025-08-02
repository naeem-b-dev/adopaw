import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { loadNamespace } from "../utils/loadNamespace";
import i18n from "../i18n";
export const useTranslationLoader = (feature) => {
  const [ready, setReady] = useState(false);
  const lang = i18n.language;
  const { t } = useTranslation(feature);

  useEffect(() => {
    let isMounted = true;

    loadNamespace(feature, lang).then(() => {
      if (isMounted) setReady(true);
    });

    return () => {
      isMounted = false;
    };
  }, [feature, lang]);

  return { t, ready };
};
