// Basic client-side auth using localStorage
const AUTH_KEY = "ss_user";

// Helpers
function isLoggedIn() {
  try { return !!JSON.parse(localStorage.getItem(AUTH_KEY)); }
  catch { return false; }
}
function loginUser(email) {
  localStorage.setItem(AUTH_KEY, JSON.stringify({ email, ts: Date.now() }));
}
function logoutUser() {
  localStorage.removeItem(AUTH_KEY);
}

// Update header auth link (Login -> Logout)
function hydrateHeaderAuthLink() {
  const authLink = document.getElementById("auth-link");
  if (!authLink) return;
  if (isLoggedIn()) {
    authLink.textContent = "Logout";
    authLink.href = "#";
    authLink.addEventListener("click", (e) => {
      e.preventDefault();
      logoutUser();
      window.location.href = "index.html";
    }, { once: true });
  } else {
    authLink.textContent = "Login";
    authLink.href = "login.html";
  }
}

// Protect generator page
function protectGenerator() {
  const onGenerator = /generator\.html(\?.*)?$/.test(location.pathname) || location.pathname.endsWith("generator.html");
  if (onGenerator && !isLoggedIn()) {
    const next = encodeURIComponent("generator.html");
    window.location.href = `login.html?next=${next}`;
  }
}

// Handle login form
function wireLogin() {
  const form = document.getElementById("login-form");
  if (!form) return;
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    if (!email || !password) return alert("Please fill in all fields.");
    // Demo auth: accept anything non-empty
    loginUser(email);
    // Redirect to ?next or generator.html
    const params = new URLSearchParams(location.search);
    const next = params.get("next") || "generator.html";
    window.location.href = next;
  });
}

// Handle register form
function wireRegister() {
  const form = document.getElementById("register-form");
  if (!form) return;
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = document.getElementById("reg-email").value.trim();
    const password = document.getElementById("reg-password").value.trim();
    const confirm = document.getElementById("reg-confirm").value.trim();
    if (!email || !password || !confirm) return alert("Please fill in all fields.");
    if (password !== confirm) return alert("Passwords do not match.");
    // Demo: “create account” locally and auto-login
    loginUser(email);
    window.location.href = "generator.html";
  });
}

// === GENERATOR ===
// Requires JSZip (via CDN in generator.html)
function wireGenerator() {
  const form = document.getElementById("generator-form");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("site-name").value.trim() || "My Site";
    const color = document.getElementById("main-color").value || "#4caf50";
    const font = document.getElementById("font-family").value || "Arial";
    const sections = Array.from(document.querySelectorAll('input[name="sections"]:checked')).map(x => x.value);

    // Build generated files
    const genCss = `
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

    const homeSection = `
<section class="hero">
  <div class="container">
    <h1>${name}</h1>
    <p>Welcome to your brand-new website generated with SiteStruck.</p>
    <a class="btn" href="about.html">Learn more</a>
  </div>
</section>
<div class="container">
  <div class="grid">
    <div class="card"><h3>Fast</h3><p>Built in seconds.</p></div>
    <div class="card"><h3>Simple</h3><p>No code required.</p></div>
    <div class="card"><h3>Responsive</h3><p>Works on any device.</p></div>
  </div>
</div>
`.trim();

    const baseHeader = `
<header>
  <div><strong>${name}</strong></div>
  <nav>
    <a href="index.html">Home</a>
    ${sections.includes("About") ? `<a href="about.html">About</a>` : ``}
    ${sections.includes("Contact") ? `<a href="contact.html">Contact</a>` : ``}
    ${sections.includes("Blog") ? `<a href="blog.html">Blog</a>` : ``}
  </nav>
</header>
`.trim();

    const baseFooter = `<footer><p>&copy; ${new Date().getFullYear()} ${name}. All rights reserved.</p></footer>`;

    const genIndex = `
<!DOCTYPE html><html lang="en"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Home - ${name}</title><link rel="stylesheet" href="style.css">
</head><body>
${baseHeader}
${homeSection}
${baseFooter}
</body></html>
`.trim();

    const genAbout = `
<!DOCTYPE html><html lang="en"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>About - ${name}</title><link rel="stylesheet" href="style.css">
</head><body>
${baseHeader}
<div class="container">
  <h1>About</h1>
  <p>This page tells your story. Edit this content as you wish.</p>
</div>
${baseFooter}
</body></html>
`.trim();

    const genContact = `
<!DOCTYPE html><html lang="en"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Contact - ${name}</title><link rel="stylesheet" href="style.css">
</head><body>
${baseHeader}
<div class="container">
  <h1>Contact</h1>
  <p>Write how people can reach you.</p>
  <div class="card" style="max-width:520px;margin:16px 0;padding:16px;">
    <form>
      <div style="display:grid;gap:10px">
        <input type="text" placeholder="Your name">
        <input type="email" placeholder="Your email">
        <textarea placeholder="Message" rows="6"></textarea>
      </div>
      <div style="margin-top:10px">
        <a class="btn" href="#">Send</a>
      </div>
    </form>
  </div>
</div>
${baseFooter}
</body></html>
`.trim();

    const genBlog = `
<!DOCTYPE html><html lang="en"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Blog - ${name}</title><link rel="stylesheet" href="style.css">
</head><body>
${baseHeader}
<div class="container">
  <h1>Blog</h1>
  <div class="grid">
    <div class="card"><h3>First post</h3><p>Replace with your content.</p></div>
    <div class="card"><h3>Second post</h3><p>Replace with your content.</p></div>
    <div class="card"><h3>Third post</h3><p>Replace with your content.</p></div>
  </div>
</div>
${baseFooter}
</body></html>
`.trim();

    // Build ZIP
    const zip = new JSZip();
    zip.file("style.css", genCss);
    zip.file("index.html", genIndex);
    if (sections.includes("About")) zip.file("about.html", genAbout);
    if (sections.includes("Contact")) zip.file("contact.html", genContact);
    if (sections.includes("Blog")) zip.file("blog.html", genBlog);

    const blob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob);

    const dl = document.createElement("a");
    dl.href = url;
    dl.download = `${name.replace(/\s+/g, "_").toLowerCase()}_site.zip`;
    dl.textContent = "Download ZIP";
    dl.className = "btn";

    const result = document.getElementById("result");
    result.innerHTML = `<p><strong>Your site is ready!</strong></p>`;
    result.appendChild(dl);
  });
}

// Boot
document.addEventListener("DOMContentLoaded", () => {
  hydrateHeaderAuthLink();
  protectGenerator();
  wireLogin();
  wireRegister();
  wireGenerator();
});

document.addEventListener("DOMContentLoaded", () => {
    const reviewForm = document.getElementById("review-form");
    const reviewFormContainer = document.getElementById("review-form-container");
    const loginWarning = document.getElementById("login-warning");
    const reviewsList = document.getElementById("reviews-list");
    const avgStarsEl = document.getElementById("avg-stars");

    const currentUser = JSON.parse(localStorage.getItem("loggedInUser"));
    const hasPurchase = currentUser && currentUser.hasPurchase === true;

    let reviews = JSON.parse(localStorage.getItem("reviews")) || [];

    function renderReviews() {
        reviewsList.innerHTML = "";
        let totalRating = 0;

        reviews.forEach(review => {
            const div = document.createElement("div");
            div.classList.add("review-item");
            div.innerHTML = `
                <strong>${review.user}</strong> - ${review.rating} ★
                <p>${review.text}</p>
            `;
            reviewsList.appendChild(div);
            totalRating += review.rating;
        });

        const avg = reviews.length ? (totalRating / reviews.length).toFixed(1) : 0;
        avgStarsEl.textContent = avg;
    }

    if (currentUser && hasPurchase) {
        reviewFormContainer.style.display = "block";
    } else {
        loginWarning.style.display = "block";
    }

    reviewForm.addEventListener("submit", e => {
        e.preventDefault();

        const text = document.getElementById("review-text").value.trim();
        const rating = parseInt(document.getElementById("review-rating").value);

        if (!text) return;

        reviews.push({
            user: currentUser.username,
            text,
            rating
        });

        localStorage.setItem("reviews", JSON.stringify(reviews));
        reviewForm.reset();
        renderReviews();
    });

    renderReviews();
});
document.addEventListener("DOMContentLoaded", () => {
    const buyButtons = document.querySelectorAll(".buy-btn");

    if (buyButtons.length > 0) {
        buyButtons.forEach(btn => {
            btn.addEventListener("click", () => {
                const currentUser = JSON.parse(localStorage.getItem("loggedInUser"));
                if (!currentUser) {
                    alert("You must log in to purchase!");
                    window.location.href = "login.html";
                    return;
                }

                const plan = btn.getAttribute("data-plan");
                alert(`You have purchased the ${plan} plan!`);

                // Update user data
                currentUser.hasPurchase = true;
                currentUser.plan = plan;

                localStorage.setItem("loggedInUser", JSON.stringify(currentUser));

                // Update in users list
                const users = JSON.parse(localStorage.getItem("users")) || [];
                const userIndex = users.findIndex(u => u.username === currentUser.username);
                if (userIndex !== -1) {
                    users[userIndex] = currentUser;
                }
                localStorage.setItem("users", JSON.stringify(users));

                window.location.href = "index.html";
            });
        });
    }
});
