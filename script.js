const LANGS = ["he", "en", "ru"];
const FALLBACK = "en";
let currentLang = FALLBACK;
let t = {};

const services = [
  "Business Websites",
  "E-commerce",
  "Web Applications",
  "Landing Pages",
  "API Integrations",
  "Speed Optimization",
  "SEO for Israeli Market",
];

const whyKeys = [
  "Clean Code",
  "High Performance",
  "Modern UI/UX",
  "Fast Delivery",
  "Support After Launch",
  "Deep understanding of Israeli business needs",
];

const pricing = [
  { key: "Basic", price: "₪3,500" },
  { key: "Business", price: "₪7,500" },
  { key: "Premium", price: "₪14,000" },
];

const portfolio = [
  { id: 1, category: "Corporate" },
  { id: 2, category: "E-commerce" },
  { id: 3, category: "Web App" },
  { id: 4, category: "Landing" },
  { id: 5, category: "Corporate" },
  { id: 6, category: "E-commerce" },
];

const calcBase = {
  Landing: 1800,
  Business: 3500,
  "E-commerce": 6200,
  "Web App": 9000,
};

let dashboardAnimated = false;

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
  const res = await fetch(`i18n/${lang}.json`);
  if (!res.ok) throw new Error("Translation load failed");
  return res.json();
}

function get(obj, path) {
  return path.split(".").reduce((acc, k) => (acc ? acc[k] : ""), obj);
}

function applyTranslations() {
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const value = get(t, el.dataset.i18n);
    if (value) el.textContent = value;
  });

  document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    const value = get(t, el.dataset.i18nPlaceholder);
    if (value) el.placeholder = value;
  });

  renderServices();
  renderWhy();
  renderPricing();
  renderFilters("All");
  updateCost();
}

function setDirection(lang) {
  const isRTL = lang === "he";
  document.documentElement.lang = lang;
  document.documentElement.dir = isRTL ? "rtl" : "ltr";
  document.body.classList.toggle("rtl", isRTL);
}

async function setLanguage(lang) {
  currentLang = LANGS.includes(lang) ? lang : FALLBACK;
  t = await loadTranslations(currentLang);
  localStorage.setItem("lang", currentLang);
  setDirection(currentLang);
  applyTranslations();
  document.querySelectorAll(".lang-btn").forEach((btn) => btn.classList.toggle("active", btn.dataset.lang === currentLang));
}

function card(title, desc = "") {
  return `<article class="card"><h3>${title}</h3>${desc ? `<p>${desc}</p>` : ""}</article>`;
}

function renderServices() {
  const root = document.getElementById("services-cards");
  root.innerHTML = services
    .map((name) => card(get(t, `services.items.${name}.title`), get(t, `services.items.${name}.desc`)))
    .join("");
}

function renderWhy() {
  document.getElementById("why-list").innerHTML = whyKeys.map((k) => card(get(t, `why.items.${k}`))).join("");
}

function renderPricing() {
  document.getElementById("pricing-cards").innerHTML = pricing
    .map((p) => card(`${get(t, `pricing.items.${p.key}.title`)} — ${p.price}`, get(t, `pricing.items.${p.key}.desc`)))
    .join("");
}

function renderFilters(active) {
  const all = ["All", "Corporate", "E-commerce", "Web App", "Landing"];
  const trans = {
    All: get(t, "portfolio.filters.all"),
    Corporate: get(t, "portfolio.filters.corporate"),
    "E-commerce": get(t, "portfolio.filters.ecommerce"),
    "Web App": get(t, "portfolio.filters.webapp"),
    Landing: get(t, "portfolio.filters.landing"),
  };
  const filters = document.getElementById("portfolio-filters");
  filters.innerHTML = all
    .map((f) => `<button class="filter-btn ${f === active ? "active" : ""}" data-filter="${f}">${trans[f]}</button>`)
    .join("");

  const grid = document.getElementById("portfolio-grid");
  const shown = active === "All" ? portfolio : portfolio.filter((p) => p.category === active);
  grid.innerHTML = shown
    .map((item) => {
      const data = get(t, `portfolio.projects.${item.id}`);
      return `
      <article class="card project-card" data-id="${item.id}">
        <h3>${data.title}</h3>
        <p>${data.short}</p>
        <div class="project-overlay"><button class="btn-secondary view-project" data-id="${item.id}">${get(t, "portfolio.viewProject")}</button></div>
      </article>`;
    })
    .join("");
}

function bindPortfolio() {
  document.getElementById("portfolio-filters").addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-filter]");
    if (!btn) return;
    renderFilters(btn.dataset.filter);
  });

  document.getElementById("portfolio-grid").addEventListener("click", (e) => {
    const btn = e.target.closest(".view-project");
    if (!btn) return;
    const id = btn.dataset.id;
    const data = get(t, `portfolio.projects.${id}`);
    document.getElementById("modal-title").textContent = data.title;
    document.getElementById("modal-description").textContent = data.full;
    document.getElementById("modal-link").href = "#";
    document.getElementById("project-modal").classList.add("open");
    document.getElementById("project-modal").setAttribute("aria-hidden", "false");
  });
}

function bindModal() {
  const modal = document.getElementById("project-modal");
  document.getElementById("close-modal").addEventListener("click", () => {
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
  });
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.classList.remove("open");
      modal.setAttribute("aria-hidden", "true");
    }
  });
}

function bindLanguageButtons() {
  document.querySelectorAll(".lang-btn").forEach((btn) => btn.addEventListener("click", () => setLanguage(btn.dataset.lang)));
}

function initReveal() {
  const io = new IntersectionObserver(
    (entries) => entries.forEach((entry) => entry.isIntersecting && entry.target.classList.add("in")),
    { threshold: 0.15 }
  );
  document.querySelectorAll(".reveal").forEach((el) => io.observe(el));
}

function updateCost() {
  const type = document.getElementById("site-type")?.value || "Business";
  const pages = Math.max(1, Number(document.getElementById("pages")?.value || 1));
  const seo = document.getElementById("seo")?.checked;
  const admin = document.getElementById("admin")?.checked;
  const api = document.getElementById("api")?.checked;
  let total = calcBase[type] + Math.max(0, pages - 1) * 220;
  if (seo) total += 850;
  if (admin) total += 1500;
  if (api) total += 1800;
  document.getElementById("total-cost").textContent = `₪${total.toLocaleString("en-US")}`;
}

function initCalculator() {
  const form = document.getElementById("cost-calculator");
  if (!form) return;
  form.addEventListener("input", updateCost);
  updateCost();
}

async function loadApiDemo() {
  const loader = document.getElementById("api-loader");
  const root = document.getElementById("api-cards");
  loader.hidden = false;
  root.innerHTML = "";
  try {
    const res = await fetch("https://jsonplaceholder.typicode.com/posts");
    const data = await res.json();
    root.innerHTML = data.slice(0, 6).map((post) => `
      <article class="api-card">
        <h4>${post.title}</h4>
        <p>${post.body.slice(0, 90)}...</p>
      </article>
    `).join("");
  } catch (error) {
    root.innerHTML = `<p class="field-error">${get(t, "demos.api.error")}</p>`;
  } finally {
    loader.hidden = true;
  }
}

function initApiDemo() {
  document.getElementById("load-posts")?.addEventListener("click", loadApiDemo);
}

function drawDashboard(progress = 1, data = []) {
  const canvas = document.getElementById("dashboard-chart");
  const ctx = canvas.getContext("2d");
  const w = canvas.clientWidth;
  const h = canvas.height;
  canvas.width = w;
  ctx.clearRect(0, 0, w, h);

  ctx.strokeStyle = "rgba(159,179,204,0.2)";
  for (let i = 1; i <= 4; i += 1) {
    const y = (h / 5) * i;
    ctx.beginPath();
    ctx.moveTo(16, y);
    ctx.lineTo(w - 16, y);
    ctx.stroke();
  }

  ctx.beginPath();
  ctx.strokeStyle = "#26e6ff";
  ctx.lineWidth = 2;
  const max = Math.max(...data, 1);
  data.forEach((v, i) => {
    const x = 20 + (i * (w - 40)) / (data.length - 1);
    const y = h - (v / max) * (h - 30) * progress - 12;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.shadowColor = "rgba(38,230,255,0.6)";
  ctx.shadowBlur = 8;
  ctx.stroke();
}

function animateDashboard() {
  const visits = 5000 + Math.floor(Math.random() * 4000);
  const users = 1400 + Math.floor(Math.random() * 2200);
  const conversions = 90 + Math.floor(Math.random() * 240);
  document.getElementById("metric-visits").textContent = visits.toLocaleString("en-US");
  document.getElementById("metric-users").textContent = users.toLocaleString("en-US");
  document.getElementById("metric-conversions").textContent = conversions.toString();

  const points = Array.from({ length: 8 }, () => 40 + Math.floor(Math.random() * 160));
  let start = null;
  const duration = 900;
  function frame(ts) {
    if (!start) start = ts;
    const progress = Math.min((ts - start) / duration, 1);
    drawDashboard(progress, points);
    if (progress < 1) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

function initDashboardDemo() {
  window.addEventListener("resize", () => dashboardAnimated && animateDashboard());
}

function validateEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function validateIsraeliPhone(value) {
  return /^(\+972|0)([23489]|5\d|7\d)\d{7}$/.test(value.replace(/[\s-]/g, ""));
}

function initFormValidationDemo() {
  const form = document.getElementById("demo-validation-form");
  const fields = {
    name: document.getElementById("demo-name"),
    email: document.getElementById("demo-email"),
    phone: document.getElementById("demo-phone"),
    message: document.getElementById("demo-message"),
  };

  const setError = (key, message) => {
    document.querySelector(`[data-error-for="${key}"]`).textContent = message || "";
  };

  const runValidation = () => {
    let valid = true;
    if (!fields.name.value.trim()) {
      setError("name", get(t, "demos.form.errors.required"));
      valid = false;
    } else setError("name", "");

    if (!fields.email.value.trim()) {
      setError("email", get(t, "demos.form.errors.required"));
      valid = false;
    } else if (!validateEmail(fields.email.value)) {
      setError("email", get(t, "demos.form.errors.email"));
      valid = false;
    } else setError("email", "");

    if (!fields.phone.value.trim()) {
      setError("phone", get(t, "demos.form.errors.required"));
      valid = false;
    } else if (!validateIsraeliPhone(fields.phone.value)) {
      setError("phone", get(t, "demos.form.errors.phone"));
      valid = false;
    } else setError("phone", "");

    if (!fields.message.value.trim()) {
      setError("message", get(t, "demos.form.errors.required"));
      valid = false;
    } else setError("message", "");

    const status = document.getElementById("form-status");
    status.textContent = valid ? get(t, "demos.form.success") : get(t, "demos.form.invalid");
    status.className = `form-status ${valid ? "ok" : "err"}`;
    return valid;
  };

  form.addEventListener("input", runValidation);
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    runValidation();
  });
}

function initDemoToggle() {
  document.querySelectorAll(".demo-toggle").forEach((btn) => {
    const target = document.getElementById(btn.dataset.demoTarget);
    btn.addEventListener("click", () => {
      target.hidden = !target.hidden;
      const isOpen = !target.hidden;
      btn.classList.toggle("active", isOpen);
      if (isOpen && target.id === "dashboard-demo" && !dashboardAnimated) {
        dashboardAnimated = true;
        animateDashboard();
      }
    });
  });
}

function startHeroCanvas() {
  const canvas = document.getElementById("hero-canvas");
  const ctx = canvas.getContext("2d", { alpha: true });
  const codeSnippets = [
    '<div className="">',
    "function initApp()",
    "const data = await fetch()",
    "export default App",
    "async / await",
    "users.map(item => item.id)",
    "fetch('/api/v1')",
  ];

  let rows = [];
  let raf = null;

  const isMobile = matchMedia("(max-width: 768px)").matches;
  const count = isMobile ? 10 : 22;

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    canvas.width = Math.floor(canvas.clientWidth * dpr);
    canvas.height = Math.floor(canvas.clientHeight * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    rows = Array.from({ length: count }, (_, i) => ({
      text: codeSnippets[i % codeSnippets.length],
      x: Math.random() * canvas.clientWidth,
      y: ((i + 1) * canvas.clientHeight) / (count + 1),
      speed: (isMobile ? 0.15 : 0.25) + Math.random() * (isMobile ? 0.35 : 0.75),
      alpha: 0.14 + Math.random() * 0.4,
      size: isMobile ? 12 : 13 + Math.random() * 5,
    }));
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
    ctx.textBaseline = "middle";
    rows.forEach((r) => {
      r.x -= r.speed;
      if (r.x < -340) r.x = canvas.clientWidth + Math.random() * 140;
      ctx.font = `500 ${r.size}px Inter, monospace`;
      ctx.shadowColor = "rgba(38,230,255,0.55)";
      ctx.shadowBlur = 7;
      ctx.fillStyle = `rgba(120, 205, 255, ${r.alpha})`;
      ctx.fillText(r.text, r.x, r.y);
    });
    raf = requestAnimationFrame(draw);
  }

  resize();
  draw();
  window.addEventListener("resize", resize);
  window.addEventListener("beforeunload", () => raf && cancelAnimationFrame(raf));
}

(async function init() {
  bindLanguageButtons();
  bindPortfolio();
  bindModal();
  initReveal();
  startHeroCanvas();
  initCalculator();
  initApiDemo();
  initDashboardDemo();
  initFormValidationDemo();
  initDemoToggle();
  await setLanguage(detectLanguage());
})();
