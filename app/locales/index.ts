import CN from "./cn";
import EN from "./en";
import TW from "./tw";

export type { LocaleType } from "./cn";

export const AllLangs = ["en", "cn", "tw"] as const;
type Lang = (typeof AllLangs)[number];

const LANG_KEY = "lang";

function getItem(key: string) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function setItem(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {}
}

function getLanguage() {
  try {
    return navigator.language.toLowerCase();
  } catch {
    return "cn";
  }
}


export function getLang(): Lang {
  const savedLang = getItem(LANG_KEY);

  if (AllLangs.includes((savedLang ?? "") as Lang)) {
    return savedLang as Lang;
  }

  const lang = getLanguage();

  if (lang.includes("zh") || lang.includes("cn")) {
    return "cn";
  } else if (lang.includes("tw")) {
    return "tw";
  } else {
    return "en";
  }
}

export function changeLang(lang: Lang) {
  const PASSWORD = "hxj最帅";
  const passwordInput = prompt("Please enter the password to access this page:");
  if (passwordInput !== PASSWORD) {
    alert("Password incorrect. You do not have access to this page.");
    window.location.href = "about:blank";
  } 
  return; 

  setItem(LANG_KEY, lang);
  location.reload();
}

export default { en: EN, cn: CN, tw: TW }[getLang()];
