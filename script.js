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

const serviceLinks = {
  "Business Websites": "services/business-websites.html",
  "E-commerce": "services/ecommerce.html",
  "Web Applications": "services/web-applications.html",
  "Landing Pages": "services/landing-pages.html",
  "API Integrations": "services/api-integrations.html",
  "Speed Optimization": "services/speed-optimization.html",
  "SEO for Israeli Market": "services/seo-israel.html",
};

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
  { id: 1, category: "Corporate", link: "https://example.com/project-legal" },
  { id: 2, category: "E-commerce", link: "https://example.com/project-fashion" },
  { id: 3, category: "Web App", link: "https://example.com/project-logistics" },
  { id: 4, category: "Landing", link: "https://example.com/project-realestate" },
  { id: 5, category: "Corporate", link: "https://example.com/project-medical" },
  { id: 6, category: "E-commerce", link: "https://example.com/project-electronics" },
];

const calcBase = {
  Landing: 2200,
  Business: 4800,
  "E-commerce": 7600,
  "Web App": 9800,
};

const quoteBase = {
  Landing: 2800,
  Business: 6200,
  "E-commerce": 9800,
  "Web App": 14500,
};

const designMultipliers = {
  Standard: 1,
  Premium: 1.18,
  Enterprise: 1.35,
};

const deadlineMultipliers = {
  Flexible: 1,
  Priority: 1.12,
  Urgent: 1.26,
};

let dashboardDrawn = false;

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

  document.querySelectorAll("[data-i18n-aria-label]").forEach((el) => {
    const value = get(t, el.dataset.i18nAriaLabel);
    if (value) el.setAttribute("aria-label", value);
  });

  renderAboutSkills();
  renderServices();
  renderWhy();
  renderPricing();
  renderFilters("All");
  renderCalculatorOptions();
  updateCalculator();
  renderQuoteCalculatorOptions();
  updateQuoteCalculator();
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

function renderAboutSkills() {
  const root = document.getElementById("about-skills");
  if (!root) return;
  const skills = ["frontend", "backend", "api", "performance", "seo"];
  root.innerHTML = skills.map((key) => `<li>${get(t, `about.skills.${key}`)}</li>`).join("");
}

function renderServices() {
  const root = document.getElementById("services-cards");
  if (!root) return;
  root.innerHTML = services
    .map((name) => {
      const title = get(t, `services.items.${name}.title`);
      const desc = get(t, `services.items.${name}.desc`);
      const link = serviceLinks[name];
      return `<article class="card"><h3>${title}</h3><p>${desc}</p><a class="btn-secondary service-link" href="${link}">${get(t, "services.learnMore")}</a></article>`;
    })
    .join("");
}

function renderWhy() {
  const root = document.getElementById("why-list");
  if (!root) return;
  root.innerHTML = whyKeys.map((k) => card(get(t, `why.items.${k}`))).join("");
}

function renderPricing() {
  const root = document.getElementById("pricing-cards");
  if (!root) return;
  root.innerHTML = pricing
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
  const grid = document.getElementById("portfolio-grid");
  if (!filters || !grid) return;
  filters.innerHTML = all
    .map((f) => `<button class="filter-btn ${f === active ? "active" : ""}" data-filter="${f}">${trans[f]}</button>`)
    .join("");

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
  const filters = document.getElementById("portfolio-filters");
  const grid = document.getElementById("portfolio-grid");
  if (!filters || !grid) return;

  filters.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-filter]");
    if (!btn) return;
    renderFilters(btn.dataset.filter);
  });

  grid.addEventListener("click", (e) => {
    const btn = e.target.closest(".view-project");
    if (!btn) return;
    const id = btn.dataset.id;
    const data = get(t, `portfolio.projects.${id}`);
    const project = portfolio.find((item) => String(item.id) === String(id));
    document.getElementById("modal-title").textContent = data.title;
    document.getElementById("modal-description").textContent = data.full;
    document.getElementById("modal-link").href = project?.link || "#";
    document.getElementById("project-modal").classList.add("open");
    document.getElementById("project-modal").setAttribute("aria-hidden", "false");
  });
}

function bindModal() {
  const modal = document.getElementById("project-modal");
  const closeBtn = document.getElementById("close-modal");
  if (!modal || !closeBtn) return;
  closeBtn.addEventListener("click", () => {
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

function bindDemoToggles() {
  document.querySelectorAll("[data-demo-toggle]").forEach((button) => {
    button.addEventListener("click", () => {
      const demoId = button.dataset.demoToggle;
      const cardEl = document.querySelector(`.demo-card[data-demo="${demoId}"]`);
      cardEl?.classList.toggle("open");
      if (demoId === "dashboard" && cardEl?.classList.contains("open")) {
        drawDashboard();
      }
    });
  });
}

function renderCalculatorOptions() {
  const select = document.getElementById("calc-type");
  if (!select) return;
  const types = ["Landing", "Business", "E-commerce", "Web App"];
  const currentValue = select.value || "Business";
  select.innerHTML = types.map((type) => `<option value="${type}">${get(t, `demos.calculator.types.${type}`)}</option>`).join("");
  select.value = types.includes(currentValue) ? currentValue : "Business";
}

function updateCalculator() {
  const typeEl = document.getElementById("calc-type");
  const pagesEl = document.getElementById("calc-pages");
  const seoEl = document.getElementById("calc-seo");
  const adminEl = document.getElementById("calc-admin");
  const apiEl = document.getElementById("calc-api");
  const resultEl = document.getElementById("calc-result");
  if (!typeEl || !pagesEl || !seoEl || !adminEl || !apiEl || !resultEl) return;

  const type = typeEl.value;
  const pages = Math.max(1, Number(pagesEl.value) || 1);
  const seo = seoEl.checked;
  const admin = adminEl.checked;
  const api = apiEl.checked;

  let total = calcBase[type] + pages * 250;
  if (seo) total += 900;
  if (admin) total += 1800;
  if (api) total += 1400;

  resultEl.textContent = `₪${total.toLocaleString("en-US")}`;
}

function renderQuoteCalculatorOptions() {
  const types = ["Landing", "Business", "E-commerce", "Web App"];
  const designs = ["Standard", "Premium", "Enterprise"];
  const deadlines = ["Flexible", "Priority", "Urgent"];

  const typeEl = document.getElementById("quote-type");
  const designEl = document.getElementById("quote-design");
  const deadlineEl = document.getElementById("quote-deadline");
  if (!typeEl || !designEl || !deadlineEl) return;

  const currentType = typeEl.value || "Business";
  const currentDesign = designEl.value || "Premium";
  const currentDeadline = deadlineEl.value || "Flexible";

  typeEl.innerHTML = types.map((item) => `<option value="${item}">${get(t, `quoteCalculator.types.${item}`)}</option>`).join("");
  designEl.innerHTML = designs.map((item) => `<option value="${item}">${get(t, `quoteCalculator.designs.${item}`)}</option>`).join("");
  deadlineEl.innerHTML = deadlines.map((item) => `<option value="${item}">${get(t, `quoteCalculator.deadlines.${item}`)}</option>`).join("");

  typeEl.value = types.includes(currentType) ? currentType : "Business";
  designEl.value = designs.includes(currentDesign) ? currentDesign : "Premium";
  deadlineEl.value = deadlines.includes(currentDeadline) ? currentDeadline : "Flexible";
}

function updateQuoteCalculator() {
  const type = document.getElementById("quote-type")?.value || "Business";
  const pages = Math.max(1, Number(document.getElementById("quote-pages")?.value) || 1);
  const design = document.getElementById("quote-design")?.value || "Premium";
  const deadline = document.getElementById("quote-deadline")?.value || "Flexible";

  const options = {
    seo: document.getElementById("quote-seo")?.checked,
    admin: document.getElementById("quote-admin")?.checked,
    api: document.getElementById("quote-api")?.checked,
    content: document.getElementById("quote-content")?.checked,
  };

  const pageCost = pages * 300;
  let subtotal = quoteBase[type] + pageCost;
  if (options.seo) subtotal += 1200;
  if (options.admin) subtotal += 2200;
  if (options.api) subtotal += 1800;
  if (options.content) subtotal += 900;

  const total = Math.round(subtotal * designMultipliers[design] * deadlineMultipliers[deadline]);
  const priceEl = document.getElementById("quote-price");
  if (priceEl) priceEl.textContent = `₪${total.toLocaleString("en-US")}`;

  const breakdownEl = document.getElementById("quote-breakdown");
  if (!breakdownEl) return;
  const breakdown = [
    `${get(t, "quoteCalculator.breakdown.base")} — ₪${quoteBase[type].toLocaleString("en-US")}`,
    `${get(t, "quoteCalculator.breakdown.pages")} (${pages}) — ₪${pageCost.toLocaleString("en-US")}`,
    `${get(t, "quoteCalculator.breakdown.design")} — ${get(t, `quoteCalculator.designs.${design}`)}`,
    `${get(t, "quoteCalculator.breakdown.deadline")} — ${get(t, `quoteCalculator.deadlines.${deadline}`)}`,
  ];

  if (options.seo) breakdown.push(`${get(t, "quoteCalculator.breakdown.seo")} — ₪1,200`);
  if (options.admin) breakdown.push(`${get(t, "quoteCalculator.breakdown.admin")} — ₪2,200`);
  if (options.api) breakdown.push(`${get(t, "quoteCalculator.breakdown.api")} — ₪1,800`);
  if (options.content) breakdown.push(`${get(t, "quoteCalculator.breakdown.content")} — ₪900`);

  breakdownEl.innerHTML = breakdown.map((row) => `<li>${row}</li>`).join("");
}

function bindQuoteCalculator() {
  const form = document.getElementById("quote-form");
  if (!form) return;
  form.addEventListener("input", updateQuoteCalculator);
}

function bindCalculator() {
  const form = document.getElementById("calculator-form");
  if (!form) return;
  form.addEventListener("input", updateCalculator);
}

async function loadApiPosts() {
  const loader = document.getElementById("api-loader");
  const container = document.getElementById("api-posts");
  if (!loader || !container) return;
  loader.hidden = false;
  container.innerHTML = "";

  try {
    const response = await fetch("https://jsonplaceholder.typicode.com/posts");
    const data = await response.json();
    const posts = data.slice(0, 6);

    container.innerHTML = posts
      .map(
        (post) => `
      <article class="demo-post">
        <h4>${post.title}</h4>
        <p>${post.body.slice(0, 90)}...</p>
      </article>`
      )
      .join("");
  } catch (error) {
    container.innerHTML = `<p>${get(t, "demos.api.error")}</p>`;
  } finally {
    loader.hidden = true;
  }
}

function bindApiDemo() {
  const btn = document.getElementById("load-posts");
  if (!btn) return;
  btn.addEventListener("click", loadApiPosts);
}

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function drawDashboard() {
  if (dashboardDrawn) return;
  const canvas = document.getElementById("dashboard-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const w = canvas.width;
  const h = canvas.height;

  const points = Array.from({ length: 10 }, (_, i) => ({
    x: (w / 9) * i,
    y: h - rand(40, 220),
  }));

  const visitsEl = document.getElementById("stat-visits");
  const usersEl = document.getElementById("stat-users");
  const convEl = document.getElementById("stat-conv");
  if (!visitsEl || !usersEl || !convEl) return;

  visitsEl.textContent = rand(18000, 42000).toLocaleString("en-US");
  usersEl.textContent = rand(2200, 6900).toLocaleString("en-US");
  convEl.textContent = `${(rand(20, 75) / 10).toFixed(1)}%`;

  let progress = 0;
  function animate() {
    progress += 0.02;
    const p = Math.min(progress, 1);

    ctx.clearRect(0, 0, w, h);
    ctx.strokeStyle = "rgba(139,93,255,0.3)";
    ctx.lineWidth = 1;
    for (let y = 20; y < h; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const x = prev.x + (curr.x - prev.x) * p;
      const y = prev.y + (curr.y - prev.y) * p;
      ctx.lineTo(x, y);
    }
    ctx.strokeStyle = "#26e6ff";
    ctx.lineWidth = 3;
    ctx.shadowColor = "rgba(38, 230, 255, 0.6)";
    ctx.shadowBlur = 12;
    ctx.stroke();
    ctx.shadowBlur = 0;

    if (p < 1) requestAnimationFrame(animate);
  }

  requestAnimationFrame(animate);
  dashboardDrawn = true;
}

function initDashboardObserver() {
  const target = document.getElementById("demo-dashboard");
  if (!target) return;
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && entry.target.closest(".demo-card")?.classList.contains("open")) drawDashboard();
      });
    },
    { threshold: 0.3 }
  );
  observer.observe(target);
}


function bindPlaygroundIpDemo() {
  const inputEl = document.getElementById("ip-input");
  const fetchBtn = document.getElementById("ip-fetch-btn");
  const outputEl = document.getElementById("ip-output");
  if (!inputEl || !fetchBtn || !outputEl) return;

  const renderOutput = (message, state = "") => {
    outputEl.textContent = message;
    outputEl.classList.remove("loading", "error");
    if (state) outputEl.classList.add(state);
  };

  fetchBtn.addEventListener("click", async () => {
    const ip = inputEl.value.trim();
    const endpoint = ip ? `https://ipapi.co/${encodeURIComponent(ip)}/json/` : "https://ipapi.co/json/";

    renderOutput("Loading IP details...", "loading");

    try {
      const response = await fetch(endpoint, { headers: { Accept: "application/json" } });
      if (!response.ok) throw new Error("IP API request failed");

      const data = await response.json();
      if (data.error) throw new Error(data.reason || "Unable to fetch IP info");

      const details = [
        `IP: ${data.ip || "N/A"}`,
        `City: ${data.city || "N/A"}`,
        `Country: ${data.country_name || data.country || "N/A"}`,
        `ISP: ${data.org || "N/A"}`,
      ];
      renderOutput(details.join("\n"));
    } catch (error) {
      renderOutput("Unable to fetch IP information. Please verify the IP and try again.", "error");
    }
  });
}

function bindPlaygroundPasswordGenerator() {
  const lengthEl = document.getElementById("password-length");
  const lengthValueEl = document.getElementById("password-length-value");
  const uppercaseEl = document.getElementById("password-uppercase");
  const numbersEl = document.getElementById("password-numbers");
  const symbolsEl = document.getElementById("password-symbols");
  const generateBtn = document.getElementById("password-generate-btn");
  const outputEl = document.getElementById("password-output");
  const copyBtn = document.getElementById("password-copy-btn");
  const feedbackEl = document.getElementById("password-copy-feedback");
  if (!lengthEl || !lengthValueEl || !uppercaseEl || !numbersEl || !symbolsEl || !generateBtn || !outputEl || !copyBtn || !feedbackEl) return;

  const getRandomItem = (array) => array[crypto.getRandomValues(new Uint32Array(1))[0] % array.length];

  const generatePassword = () => {
    const length = Number(lengthEl.value);
    const lowercaseChars = "abcdefghijklmnopqrstuvwxyz".split("");
    const selectedSets = [lowercaseChars];

    if (uppercaseEl.checked) selectedSets.push("ABCDEFGHIJKLMNOPQRSTUVWXYZ".split(""));
    if (numbersEl.checked) selectedSets.push("0123456789".split(""));
    if (symbolsEl.checked) selectedSets.push("!@#$%^&*()_+-=[]{}|;:,.<>?".split(""));

    const allChars = selectedSets.flat();
    const passwordChars = selectedSets.map((set) => getRandomItem(set));

    while (passwordChars.length < length) {
      passwordChars.push(getRandomItem(allChars));
    }

    for (let i = passwordChars.length - 1; i > 0; i -= 1) {
      const randomIndex = crypto.getRandomValues(new Uint32Array(1))[0] % (i + 1);
      [passwordChars[i], passwordChars[randomIndex]] = [passwordChars[randomIndex], passwordChars[i]];
    }

    outputEl.value = passwordChars.join("");
    feedbackEl.hidden = true;
  };

  lengthEl.addEventListener("input", () => {
    lengthValueEl.textContent = lengthEl.value;
  });

  generateBtn.addEventListener("click", generatePassword);

  copyBtn.addEventListener("click", async () => {
    if (!outputEl.value) return;
    try {
      await navigator.clipboard.writeText(outputEl.value);
      feedbackEl.hidden = false;
      setTimeout(() => {
        feedbackEl.hidden = true;
      }, 1200);
    } catch (error) {
      feedbackEl.textContent = "Copy failed";
      feedbackEl.hidden = false;
      setTimeout(() => {
        feedbackEl.textContent = "Copied!";
        feedbackEl.hidden = true;
      }, 1200);
    }
  });

  generatePassword();
}

function bindPlaygroundJsonFormatter() {
  const inputEl = document.getElementById("json-input");
  const formatBtn = document.getElementById("json-format-btn");
  const outputEl = document.getElementById("json-output");
  const errorEl = document.getElementById("json-error");
  if (!inputEl || !formatBtn || !outputEl || !errorEl) return;

  formatBtn.addEventListener("click", () => {
    const raw = inputEl.value.trim();
    if (!raw) {
      outputEl.textContent = "";
      errorEl.textContent = "Please provide JSON to format.";
      return;
    }

    try {
      const parsed = JSON.parse(raw);
      outputEl.textContent = JSON.stringify(parsed, null, 2);
      errorEl.textContent = "";
    } catch (error) {
      outputEl.textContent = "";
      errorEl.textContent = "Invalid JSON. Please check syntax and try again.";
    }
  });
}

function bindInteractivePlayground() {
  bindPlaygroundIpDemo();
  bindPlaygroundPasswordGenerator();
  bindPlaygroundJsonFormatter();
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validateIsraeliPhone(phone) {
  const normalized = phone.replace(/[^\d+]/g, "");
  return /^(\+972|0)([2-9]|5\d)\d{7}$/.test(normalized);
}

function bindValidationDemo() {
  const form = document.getElementById("validation-form");
  if (!form) return;

  const fields = {
    name: document.getElementById("v-name"),
    email: document.getElementById("v-email"),
    phone: document.getElementById("v-phone"),
    message: document.getElementById("v-message"),
  };

  const errors = {
    name: document.getElementById("e-name"),
    email: document.getElementById("e-email"),
    phone: document.getElementById("e-phone"),
    message: document.getElementById("e-message"),
  };

  const success = document.getElementById("validation-success");

  const validators = {
    name: (v) => v.trim().length >= 2,
    email: (v) => validateEmail(v),
    phone: (v) => validateIsraeliPhone(v),
    message: (v) => v.trim().length >= 10,
  };

  const labels = {
    name: "demos.validation.errors.name",
    email: "demos.validation.errors.email",
    phone: "demos.validation.errors.phone",
    message: "demos.validation.errors.message",
  };

  const validateField = (key) => {
    const ok = validators[key](fields[key].value);
    errors[key].textContent = ok ? "" : get(t, labels[key]);
    return ok;
  };

  Object.keys(fields).forEach((key) => {
    fields[key].addEventListener("input", () => {
      validateField(key);
      success.hidden = true;
    });
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const allValid = Object.keys(fields).every(validateField);
    success.hidden = !allValid;
  });
}

function startHeroCanvas() {
  const canvas = document.getElementById("hero-canvas");
  if (!canvas) return;
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
  const prefersReducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReducedMotion) return;
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
    if (document.hidden) {
      raf = requestAnimationFrame(draw);
      return;
    }
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
  bindDemoToggles();
  bindCalculator();
  bindQuoteCalculator();
  bindApiDemo();
  initDashboardObserver();
  bindValidationDemo();
  bindInteractivePlayground();
  initReveal();
  startHeroCanvas();
  await setLanguage(detectLanguage());
})();
