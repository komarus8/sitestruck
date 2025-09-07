/* ====== SiteStruck demo app (auth, purchases, reviews, generator, my-pages) ====== */
/* Storage keys */
const USERS_KEY   = "ss_users";     // array of user objects
const SESSION_KEY = "ss_user";      // { email }
const REVIEWS_KEY = "ss_reviews";   // array of {email,name,rating,text,ts}

/* Plan limits for number of generated sites */
const PLAN_LIMITS = { Basic: 1, Pro: 3, Premium: 10 };

/* ===== Helpers for storage ===== */
const readJSON = (k, fallback) => {
  try { return JSON.parse(localStorage.getItem(k)) ?? fallback; }
  catch { return fallback; }
};
const writeJSON = (k, v) => localStorage.setItem(k, JSON.stringify(v));

/* ===== Users ===== */
function getUsers() { return readJSON(USERS_KEY, []); }
function saveUsers(list) { writeJSON(USERS_KEY, list); }
function findUser(email) { return getUsers().find(u => u.email === email); }
function upsertUser(user) {
  const users = getUsers();
  const idx = users.findIndex(u => u.email === user.email);
  if (idx === -1) users.push(user); else users[idx] = user;
  saveUsers(users);
}

/* ===== Session ===== */
function currentSession() { return readJSON(SESSION_KEY, null); }
function getCurrentUser() {
  const s = currentSession();
  if (!s) return null;
  return findUser(s.email) || null;
}
function login(email) {
  const u = findUser(email);
  if (!u) return false;
  localStorage.setItem(SESSION_KEY, JSON.stringify({ email }));
  return true;
}
function logout() { localStorage.removeItem(SESSION_KEY); }

/* ===== UI helpers ===== */
function setActiveNav() {
  const path = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".navbar a").forEach(a => {
    const href = a.getAttribute("href");
    if (!href) return;
    const file = href.split("/").pop();
    if (file === path) a.classList.add("active");
  });
}

function hydrateHeader() {
  const user = getCurrentUser();
  const authLink = document.getElementById("auth-link");
  const authOnlyEls = document.querySelectorAll(".auth-only");

  if (user) {
    authOnlyEls.forEach(el => el.style.display = "");
    if (authLink) {
      authLink.textContent = "Logout";
      authLink.href = "#";
      authLink.onclick = (e) => {
        e.preventDefault();
        logout();
        location.href = "index.html";
      };
      authLink.classList.add("btn","small");
    }
  } else {
    authOnlyEls.forEach(el => el.style.display = "none");
    if (authLink) {
      authLink.textContent = "Login";
      authLink.href = "login.html";
      authLink.onclick = null;
      authLink.classList.add("btn","small");
    }
  }
  setActiveNav();
}

/* ===== Route protection ===== */
function requireLoginRedirect(nextPath = "index.html") {
  const user = getCurrentUser();
  if (!user) {
    const next = encodeURIComponent(nextPath);
    location.href = `login.html?next=${next}`;
    return false;
  }
  return true;
}
function requirePurchaseRedirect(nextPath = "index.html") {
  const user = getCurrentUser();
  if (!user) return requireLoginRedirect(nextPath);
  if (!user.plan) {
    location.href = "pricing.html";
    return false;
  }
  return true;
}

/* ===== Forms: login / register ===== */
function wireLoginForm() {
  const form = document.getElementById("login-form");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value.trim().toLowerCase();
    const password = document.getElementById("password").value.trim();
    if (!email || !password) return alert("Please fill in all fields.");

    const user = findUser(email);
    if (!user || user.password !== password) {
      alert("Invalid email or password.");
      return;
    }
    login(email);
    const next = new URLSearchParams(location.search).get("next") || "index.html";
    location.href = next;
  });
}

function wireRegisterForm() {
  const form = document.getElementById("register-form");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = document.getElementById("reg-email").value.trim().toLowerCase();
    const password = document.getElementById("reg-password").value.trim();
    const confirm = document.getElementById("reg-confirm").value.trim();
    if (!email || !password || !confirm) return alert("Please fill in all fields.");
    if (password !== confirm) return alert("Passwords do not match.");

    if (findUser(email)) return alert("Account already exists.");
    const user = { email, password, plan: null, sites: [] };
    upsertUser(user);
    login(email);
    location.href = "pricing.html";
  });
}

/* ===== Pricing (purchase) ===== */
function wirePricing() {
  document.querySelectorAll(".buy-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const plan = btn.dataset.plan;
      const logged = requireLoginRedirect("pricing.html");
      if (!logged) return;

      const user = getCurrentUser();
      const cur = user.plan;
      if (cur && cur === plan) {
        alert(`You already have the ${plan} plan.`);
        location.href = "my-pages.html";
        return;
      }
      if (cur && PLAN_LIMITS[plan] < PLAN_LIMITS[cur]) {
        const ok = confirm(`You currently have ${cur}. Switching to ${plan} reduces your limit (${PLAN_LIMITS[cur]} → ${PLAN_LIMITS[plan]}). Continue?`);
        if (!ok) return;
      }

      user.plan = plan;
      upsertUser(user);
      alert(`Purchase successful! Your active plan: ${plan}.`);
      location.href = "my-pages.html";
    });
  });
}

/* ===== Reviews (index) ===== */
function formatStars(n) {
  const full = Math.round(n); // display rounded
  return "★★★★★☆☆☆☆☆".slice(5 - Math.min(5, full), 10 - Math.min(5, full));
}
function wireReviews() {
  const container = document.getElementById("reviews-container");
  if (!container) return;
  const listEl = document.getElementById("reviews-list");
  const avgEl  = document.getElementById("avg-rating");
  const form   = document.getElementById("review-form");
  const ratingEl = document.getElementById("review-rating");
  const textEl = document.getElementById("review-text");
  const notice = document.getElementById("review-notice");

  const user = getCurrentUser();
  const reviews = readJSON(REVIEWS_KEY, []);

  function canReview() {
    if (!user) return false;
    if (!user.plan) return false;
    return !reviews.some(r => r.email === user.email);
  }

  function render() {
    listEl.innerHTML = "";
    if (reviews.length === 0) {
      listEl.innerHTML = `<p class="muted">No reviews yet.</p>`;
      avgEl.textContent = "—";
      return;
    }
    let sum = 0;
    reviews.forEach(r => {
      sum += r.rating;
      const li = document.createElement("div");
      li.className = "review-item";
      li.innerHTML = `
        <div class="stars" aria-label="${r.rating} stars">${"★".repeat(r.rating)}${"☆".repeat(5-r.rating)}</div>
        <strong>${r.email}</strong>
        <p>${r.text}</p>
      `;
      listEl.appendChild(li);
    });
    const avg = (sum / reviews.length).toFixed(1);
    avgEl.textContent = `${avg}/5`;
  }

  if (user && user.plan && canReview()) {
    form.classList.remove("hidden");
    notice.classList.add("hidden");
  } else {
    form.classList.add("hidden");
    notice.classList.remove("hidden");
    if (!user) notice.textContent = "Log in and purchase a plan to add a review.";
    else if (!user.plan) notice.textContent = "Purchase a plan to add a review.";
    else notice.textContent = "You have already submitted a review. Thank you!";
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const rating = parseInt(ratingEl.value, 10);
    const text = textEl.value.trim();
    if (!rating || rating < 1 || rating > 5) return alert("Please select 1–5 stars.");
    if (!text) return alert("Please write a short review.");

    const arr = readJSON(REVIEWS_KEY, []);
    if (arr.some(r => r.email === user.email)) {
      alert("You already submitted a review.");
      return;
    }
    arr.push({ email: user.email, rating, text, ts: Date.now() });
    writeJSON(REVIEWS_KEY, arr);
    ratingEl.value = "5"; textEl.value = "";
    alert("Thanks for your review!");
    location.reload();
  });

  render();
}

/* ===== Generator ===== */
function getPlanLimit(plan) { return PLAN_LIMITS[plan] ?? 0; }

function protectGeneratorRoute() {
  if (!requirePurchaseRedirect("generator.html")) return;
  const user = getCurrentUser();
  const limit = getPlanLimit(user.plan);
  const used = (user.sites || []).length;
  const infoEl = document.getElementById("quota-info");
  if (infoEl) infoEl.textContent = `You can generate ${limit} site(s). Used: ${used}/${limit}.`;
}

function buildZipFromConfig(cfg) {
  const { name, color, font, sections } = cfg;
  const css = `
:root { --brand: ${color}; --brand-dark: #2f7d35; --text: #222; --muted: #666; --card: #fff; }
*{box-sizing:border-box}
body{margin:0;font-family:${font},system-ui,Arial,sans-serif;color:var(--text);background:#f7f7f7}
header{background:#1e1e1e;color:#eee;padding:14px 22px;display:flex;justify-content:space-between;align-items:center}
nav a{color:#ddd;text-decoration:none;margin-left:16px;font-weight:700}
nav a:hover{color:#fff}
.container{width:min(1100px,92%);margin:0 auto;padding:26px 0}
.hero{padding:80px 0;background:linear-gradient(120deg,var(--brand),var(--brand-dark));color:#fff;text-align:center}
.btn{display:inline-block;background:#fff;color:#111;padding:10px 16px;border-radius:10px;text-decoration:none;font-weight:800}
.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:18px}
.card{background:var(--card);border-radius:12px;padding:18px;box-shadow:0 8px 20px rgba(0,0,0,.08)}
footer{background:#202020;color:#ccc;text-align:center;padding:18px;margin-top:40px}
@media (max-width:900px){.grid{grid-template-columns:1fr 1fr}}
@media (max-width:640px){.grid{grid-template-columns:1fr}}
`.trim();

  const header = `
<header>
  <div><strong>${name}</strong></div>
  <nav>
    <a href="index.html">Home</a>
    ${sections.includes("About") ? `<a href="about.html">About</a>` : ``}
    ${sections.includes("Contact") ? `<a href="contact.html">Contact</a>` : ``}
    ${sections.includes("Blog") ? `<a href="blog.html">Blog</a>` : ``}
  </nav>
</header>`.trim();

  const footer = `<footer><p>&copy; ${new Date().getFullYear()} ${name}. All rights reserved.</p></footer>`;

  const home = `
<section class="hero">
  <div class="container">
    <h1>${name}</h1>
    <p>Welcome to your brand-new website generated with SiteStruck.</p>
    <a class="btn" href="${sections.includes("About") ? "about.html" : "#"}">Learn more</a>
  </div>
</section>
<div class="container">
  <div class="grid">
    <div class="card"><h3>Fast</h3><p>Built in seconds.</p></div>
    <div class="card"><h3>Simple</h3><p>No code required.</p></div>
    <div class="card"><h3>Responsive</h3><p>Works on any device.</p></div>
  </div>
</div>`.trim();

  const indexHtml = `
<!DOCTYPE html><html lang="en"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Home - ${name}</title><link rel="stylesheet" href="style.css">
</head><body>${header}${home}${footer}</body></html>`.trim();

  const aboutHtml = `
<!DOCTYPE html><html lang="en"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>About - ${name}</title><link rel="stylesheet" href="style.css">
</head><body>${header}<div class="container"><h1>About</h1><p>This page tells your story. Edit this content as you wish.</p></div>${footer}</body></html>`.trim();

  const contactHtml = `
<!DOCTYPE html><html lang="en"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Contact - ${name}</title><link rel="stylesheet" href="style.css">
</head><body>${header}<div class="container"><h1>Contact</h1><div class="card" style="max-width:520px;margin:16px 0;"><form><div style="display:grid;gap:10px">
<input type="text" placeholder="Your name"><input type="email" placeholder="Your email"><textarea placeholder="Message" rows="6"></textarea>
</div><div style="margin-top:10px"><a class="btn" href="#">Send</a></div></form></div></div>${footer}</body></html>`.trim();

  const blogHtml = `
<!DOCTYPE html><html lang="en"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Blog - ${name}</title><link rel="stylesheet" href="style.css">
</head><body>${header}<div class="container"><h1>Blog</h1><div class="grid"><div class="card"><h3>First post</h3><p>Replace with your content.</p></div><div class="card"><h3>Second post</h3><p>Replace with your content.</p></div><div class="card"><h3>Third post</h3><p>Replace with your content.</p></div></div></div>${footer}</body></html>`.trim();

  const zip = new JSZip();
  zip.file("style.css", css);
  zip.file("index.html", indexHtml);
  if (sections.includes("About"))   zip.file("about.html", aboutHtml);
  if (sections.includes("Contact")) zip.file("contact.html", contactHtml);
  if (sections.includes("Blog"))    zip.file("blog.html", blogHtml);

  return zip.generateAsync({ type: "blob" });
}

async function downloadZipFromConfig(cfg) {
  const blob = await buildZipFromConfig(cfg);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${cfg.name.replace(/\s+/g,"_").toLowerCase()}_site.zip`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function wireGeneratorForm() {
  const form = document.getElementById("generator-form");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const user = getCurrentUser();
    if (!user) return requireLoginRedirect("generator.html");
    if (!user.plan) return requirePurchaseRedirect("generator.html");

    const limit = getPlanLimit(user.plan);
    const used = (user.sites || []).length;
    if (used >= limit) {
      alert(`Limit reached for ${user.plan} plan (${used}/${limit}). Upgrade your plan to create more sites.`);
      location.href = "pricing.html";
      return;
    }

    const name = document.getElementById("site-name").value.trim() || "My Site";
    const color = document.getElementById("main-color").value || "#4caf50";
    const font  = document.getElementById("font-family").value || "Arial";
    const sections = Array.from(document.querySelectorAll('input[name="sections"]:checked')).map(x => x.value);

    const cfg = { name, color, font, sections };
    // Save to user's sites
    user.sites = user.sites || [];
    user.sites.push({ ...cfg, ts: Date.now() });
    upsertUser(user);

    // Build & download
    const resultEl = document.getElementById("result");
    resultEl.innerHTML = `<p><strong>Your site is being prepared…</strong></p>`;
    await downloadZipFromConfig(cfg);
    resultEl.innerHTML = `<p><strong>Your site is ready. Check your downloads.</strong></p>`;

    // Refresh quota info
    protectGeneratorRoute();
  });
}

/* ===== My Pages ===== */
function renderMyPages() {
  const wrap = document.getElementById("mypages-wrap");
  if (!wrap) return;

  if (!requireLoginRedirect("my-pages.html")) return;
  const user = getCurrentUser();
  const limit = user.plan ? getPlanLimit(user.plan) : 0;
  const used  = (user.sites || []).length;

  document.getElementById("plan-badge").textContent = user.plan ? user.plan : "No plan";
  const quota = document.getElementById("plan-quota");
  quota.textContent = user.plan ? `${used}/${limit}` : "0/0";

  const hint = document.getElementById("plan-hint");
  if (!user.plan) {
    hint.innerHTML = `You have no active plan. <a class="btn small" href="pricing.html">Buy a plan</a>`;
  } else {
    hint.innerHTML = `<a class="btn small" href="generator.html">Create new site</a>`;
  }

  const tbody = document.getElementById("sites-tbody");
  tbody.innerHTML = "";
  (user.sites || []).forEach((s, i) => {
    const tr = document.createElement("tr");
    const dt = new Date(s.ts).toLocaleString();
    tr.innerHTML = `
      <td>${s.name}</td>
      <td><span class="badge">${s.font}</span></td>
      <td><span class="badge">${s.color}</span></td>
      <td>${s.sections.join(", ") || "—"}</td>
      <td>${dt}</td>
      <td><button class="btn small" data-index="${i}">Re-download</button></td>
    `;
    tbody.appendChild(tr);
  });

  tbody.querySelectorAll("button[data-index]").forEach(btn => {
    btn.addEventListener("click", async () => {
      const idx = parseInt(btn.dataset.index, 10);
      const cfg = user.sites[idx];
      await downloadZipFromConfig(cfg);
    });
  });
}

/* ===== Contact (demo save) ===== */
function wireContactForm() {
  const form = document.getElementById("contact-form");
  if (!form) return;
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const payload = {
      name: document.getElementById("c-name").value.trim(),
      email: document.getElementById("c-email").value.trim(),
      msg: document.getElementById("c-msg").value.trim(),
      ts: Date.now()
    };
    const store = readJSON("ss_contacts", []);
    store.push(payload);
    writeJSON("ss_contacts", store);
    alert("Thanks! We'll get back to you soon.");
    form.reset();
  });
}

/* ===== Boot ===== */
document.addEventListener("DOMContentLoaded", () => {
  hydrateHeader();
  wireLoginForm();
  wireRegisterForm();
  wirePricing();
  wireReviews();
  wireGeneratorForm();
  renderMyPages();
  wireContactForm();
  // Route guards
  if (location.pathname.endsWith("generator.html")) protectGeneratorRoute();
});
