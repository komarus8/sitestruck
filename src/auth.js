// === Simple client-side auth + data model (LocalStorage) ===
// Keys
const LS_USERS = "ss_users"; // array of user objects
const LS_CURRENT = "ss_current_email"; // string (email)

// User shape:
// {
//   email, username, password,
//   purchases: [{ plan, ts }],
//   pages: [{ name, color, font, sections:[] }],
//   review: { rating, text, ts } | null,
//   createdAt
// }

function readUsers() {
  try { return JSON.parse(localStorage.getItem(LS_USERS)) || []; }
  catch { return []; }
}
function writeUsers(arr) {
  localStorage.setItem(LS_USERS, JSON.stringify(arr));
}
function getCurrentEmail() {
  return localStorage.getItem(LS_CURRENT);
}
function setCurrentEmail(email) {
  if (email) localStorage.setItem(LS_CURRENT, email);
  else localStorage.removeItem(LS_CURRENT);
}
function getCurrentUser() {
  const email = getCurrentEmail();
  if (!email) return null;
  const users = readUsers();
  return users.find(u => u.email === email) || null;
}
function saveUser(user) {
  const users = readUsers();
  const i = users.findIndex(u => u.email === user.email);
  if (i !== -1) users[i] = user; else users.push(user);
  writeUsers(users);
}
function logoutUser() { setCurrentEmail(null); }

function isLoggedIn() { return !!getCurrentEmail(); }
function hasAnyPurchase(user) { return user && Array.isArray(user.purchases) && user.purchases.length > 0; }
function hasActiveSite(user) { return user && Array.isArray(user.pages) && user.pages.length > 0; }

// Header auth link + protect links
function hydrateHeaderAuthLink() {
  const authLink = document.getElementById("auth-link");
  const protectedLinks = document.querySelectorAll(".auth-protected");

  if (isLoggedIn()) {
    // show protected links
    protectedLinks.forEach(a => a.classList.remove("hidden"));
    if (authLink) {
      authLink.textContent = "Logout";
      authLink.href = "#";
      authLink.addEventListener("click", e => {
        e.preventDefault();
        logoutUser();
        window.location.href = "index.html";
      }, { once: true });
    }
  } else {
    // hide protected links for guests (optional)
    protectedLinks.forEach(a => a.classList.remove("hidden")); // we keep visible but redirect on click
    if (authLink) {
      authLink.textContent = "Login";
      authLink.href = "login.html";
    }
  }
}

// Redirect to login if not authenticated for target pages
function guardAuthPages() {
  const mustAuth = /generator\.html$|mypages\.html$/.test(location.pathname);
  if (mustAuth && !isLoggedIn()) {
    const next = encodeURIComponent(location.pathname.split("/").pop());
    window.location.href = `login.html?next=${next}`;
  }
}

// ===== Register / Login wiring =====
document.addEventListener("DOMContentLoaded", () => {
  hydrateHeaderAuthLink();
  guardAuthPages();

  // login form
  const loginForm = document.getElementById("login-form");
  if (loginForm) {
    loginForm.addEventListener("submit", e => {
      e.preventDefault();
      const email = document.getElementById("email").value.trim().toLowerCase();
      const password = document.getElementById("password").value.trim();
      const users = readUsers();
      const u = users.find(x => x.email === email && x.password === password);
      if (!u) { alert("Invalid credentials."); return; }
      setCurrentEmail(email);
      const params = new URLSearchParams(location.search);
      const next = params.get("next") || "generator.html";
      window.location.href = next;
    });
  }

  // register form
  const regForm = document.getElementById("register-form");
  if (regForm) {
    regForm.addEventListener("submit", e => {
      e.preventDefault();
      const username = document.getElementById("reg-username").value.trim();
      const email = document.getElementById("reg-email").value.trim().toLowerCase();
      const pwd = document.getElementById("reg-password").value.trim();
      const conf = document.getElementById("reg-confirm").value.trim();
      if (!username || !email || !pwd || !conf) { alert("Fill all fields."); return; }
      if (pwd !== conf) { alert("Passwords do not match."); return; }

      const users = readUsers();
      if (users.some(u => u.email === email)) { alert("Email already registered."); return; }

      const user = {
        email, username, password: pwd,
        purchases: [],
        pages: [],
        review: null,
        createdAt: Date.now()
      };
      users.push(user);
      writeUsers(users);
      setCurrentEmail(email);
      window.location.href = "generator.html";
    });
  }

  // Pricing buy buttons (simulate checkout)
  document.querySelectorAll(".buy-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const user = getCurrentUser();
      const plan = btn.getAttribute("data-plan");
      if (!user) {
        window.location.href = "login.html?next=pricing.html";
        return;
      }
      user.purchases = user.purchases || [];
      user.purchases.push({ plan, ts: Date.now() });
      saveUser(user);
      alert(`Purchased: ${plan}. You can now generate your site.`);
      window.location.href = "generator.html";
    });
  });

  // Reviews (index)
  const reviewForm = document.getElementById("review-form");
  if (reviewForm) {
    const loginWarning = document.getElementById("login-warning");
    const already = document.getElementById("review-already");
    const formWrap = document.getElementById("review-form-container");
    const avgStars = document.getElementById("avg-stars");
    const reviewsCount = document.getElementById("reviews-count");
    const list = document.getElementById("reviews-list");

    // derive all reviews from users array
    function collectReviews() {
      const users = readUsers();
      const arr = [];
      users.forEach(u => { if (u.review) arr.push({ user:u.username, ...u.review }); });
      return arr.sort((a,b)=>b.ts-a.ts);
    }
    function renderReviews() {
      const all = collectReviews();
      list.innerHTML = "";
      let sum = 0;
      all.forEach(r => {
        sum += r.rating;
        const div = document.createElement("div");
        div.className = "card";
        div.innerHTML = `<strong>${r.user}</strong> — ${r.rating} ★<p class="mt-8">${escapeHtml(r.text)}</p>`;
        list.appendChild(div);
      });
      const avg = all.length ? (sum/all.length).toFixed(1) : "0.0";
      avgStars.textContent = avg;
      reviewsCount.textContent = String(all.length);
    }

    const u = getCurrentUser();
    if (!u || !hasAnyPurchase(u)) {
      loginWarning.classList.remove("hidden");
    } else if (u.review) {
      already.classList.remove("hidden");
    } else {
      formWrap.classList.remove("hidden");
    }

    reviewForm.addEventListener("submit", e => {
      e.preventDefault();
      const rating = parseInt(document.getElementById("review-rating").value, 10);
      const text = document.getElementById("review-text").value.trim();
      if (!text || !(rating>=1 && rating<=5)) { alert("Fill review and select rating 1–5."); return; }
      const user = getCurrentUser();
      if (!user) { alert("Login first."); return; }
      if (!hasAnyPurchase(user)) { alert("Purchase required to review."); return; }
      if (user.review) { alert("You already posted a review."); return; }
      user.review = { rating, text, ts: Date.now() };
      saveUser(user);
      (document.getElementById("review-form")).reset();
      alert("Thanks for your review!");
      location.reload();
    });

    renderReviews();
  }
});

// Small helper
function escapeHtml(s) {
  return s.replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
}
