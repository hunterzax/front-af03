export const fallbackLng = "th";
export const languages = [fallbackLng, "en"];
export const cookieName = "i18next";
export const defaultNS = "default";

export function getOptions(
  lng = fallbackLng,
  ns: string | string[] = defaultNS
) {
  return {
    supportedLngs: languages,
    fallbackLng,
    lng,
    fallbackNS: defaultNS,
    defaultNS,
    ns,
  };
}