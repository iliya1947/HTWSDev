const LANGS = ["he", "en", "ru"];
const FALLBACK = "en";
let currentLang = FALLBACK;
let t = {};

function detectLanguage() {
  const saved = localStorage.getItem("lang");
  if (saved && LANGS.includes(saved)) return saved;
  const candidates = [navigator.language, ...(navigator.languages || [])].filter(Boolean);
  for (const c of candidates) {
    const lc = c.toLowerCase();
    if (lc.startsWith("he")) return "he";
    if (lc.startsWith("ru")) return "ru";
  }
  return "en";
}

async function loadTranslations(lang) {
  const res = await fetch(`../i18n/${lang}.json`);
  if (!res.ok) throw new Error("Translation load failed");
  return res.json();
}

function get(obj, path) {
  return path.split(".").reduce((acc, k) => (acc ? acc[k] : ""), obj);
}

function setDirection(lang) {
  const isRTL = lang === "he";
  document.documentElement.lang = lang;
  document.documentElement.dir = isRTL ? "rtl" : "ltr";
  document.body.classList.toggle("rtl", isRTL);
}

function renderServicePage() {
  const key = document.body.dataset.serviceKey;
  const data = get(t, `servicePages.${key}`);
  if (!data) return;

  document.title = `${data.title} | High-Tech Websites Development`;
  document.querySelector('meta[name="description"]').setAttribute("content", data.subtitle);

  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const value = get(t, el.dataset.i18n);
    if (value) el.textContent = value;
  });

  document.getElementById("service-title").textContent = data.title;
  document.getElementById("service-subtitle").textContent = data.subtitle;
  document.getElementById("service-intro").textContent = data.intro;
  document.getElementById("service-outro").textContent = data.outro;

  document.getElementById("service-process").innerHTML = data.process.map((item) => `<li>${item}</li>`).join("");
  document.getElementById("service-deliverables").innerHTML = data.deliverables.map((item) => `<li>${item}</li>`).join("");
  document.getElementById("service-fit").innerHTML = data.fit.map((item) => `<li>${item}</li>`).join("");
}

async function setLanguage(lang) {
  currentLang = LANGS.includes(lang) ? lang : FALLBACK;
  t = await loadTranslations(currentLang);
  localStorage.setItem("lang", currentLang);
  setDirection(currentLang);
  renderServicePage();
  document.querySelectorAll(".lang-btn").forEach((btn) => btn.classList.toggle("active", btn.dataset.lang === currentLang));
}

function bindLanguageButtons() {
  document.querySelectorAll(".lang-btn").forEach((btn) => btn.addEventListener("click", () => setLanguage(btn.dataset.lang)));
}

(async function init() {
  bindLanguageButtons();
  await setLanguage(detectLanguage());
})();
