// Generator page logic + ZIP build (with JSZip on generator/mypages)

async function ensureGeneratorAccess() {
  const user = getCurrentUser();
  const need = document.getElementById("no-purchase");
  const hasSite = document.getElementById("has-site");
  const wrap = document.getElementById("generator-wrap");
  if (!wrap) return;

  if (!user) { window.location.href = "login.html?next=generator.html"; return; }

  if (!hasAnyPurchase(user)) {
    need.classList.remove("hidden");
    wrap.classList.add("hidden");
    return;
  }
  if (hasActiveSite(user)) {
    hasSite.classList.remove("hidden");
    wrap.classList.add("hidden");
    return;
  }
  // ok to generate
  wrap.classList.remove("hidden");
}

document.addEventListener("DOMContentLoaded", () => {
  // Only on generator page
  const form = document.getElementById("generator-form");
  if (form) {
    ensureGeneratorAccess();

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const user = getCurrentUser();
      if (!user) { window.location.href = "login.html?next=generator.html"; return; }
      if (!hasAnyPurchase(user)) { alert("Buy a plan first."); return; }
      if (hasActiveSite(user)) { alert("You already have a generated site."); return; }

      const name = document.getElementById("site-name").value.trim() || "My Site";
      const color = document.getElementById("main-color").value || "#4caf50";
      const font = document.getElementById("font-family").value || "Arial";
      const sections = Array.from(document.querySelectorAll('input[name="sections"]:checked')).map(x => x.value);

      // Save as user's single page metadata
      user.pages = [{ name, color, font, sections }];
      saveUser(user);

      // Download ZIP now:
      await downloadGeneratedZip({ name, color, font, sections });

      // Show result text
      const res = document.getElementById("result");
      res.innerHTML = `<p><strong>Your site is saved under My Pages.</strong></p>
        <p>You can re-download it anytime.</p>
        <a class="btn" href="mypages.html">Go to My Pages</a>`;
    });
  }
});

// Rebuild & download a ZIP from metadata (used on generator & mypages)
async function downloadGeneratedZip(meta) {
  const { name, color, font, sections } = meta;

  const css = `
:root { --brand: ${color}; --brand-dark: #2f7d35; --text:#222; --muted:#666; --card:#fff; }
*{box-sizing:border-box}
body{margin:0;font-family:${font},system-ui,Arial,sans-serif;color:var(--text);background:#f7f7f7}
.container{width:min(1100px,92%);margin:0 auto}
header{background:#1e1e1e;color:#eee;padding:14px 22px;display:flex;justify-content:space-between;align-items:center}
header .name{font-weight:800}
nav a{color:#ddd;text-decoration:none;margin-left:16px;font-weight:700;position:relative;padding:6px 4px}
nav a:hover{color:#fff}
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
  <div class="name">${name}</div>
  <nav>
    <a href="index.html">Home</a>
    ${sections.includes("About") ? `<a href="about.html">About</a>` : ``}
    ${sections.includes("Contact") ? `<a href="contact.html">Contact</a>` : ``}
    ${sections.includes("Blog") ? `<a href="blog.html">Blog</a>` : ``}
  </nav>
</header>
  `.trim();

  const footer = `<footer><p>&copy; ${new Date().getFullYear()} ${name}. All rights reserved.</p></footer>`;

  const home = `
<!DOCTYPE html><html lang="en"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Home - ${name}</title><link rel="stylesheet" href="style.css">
</head><body>
${header}
<section class="hero">
  <div class="container">
    <h1>${name}</h1>
    <p>Welcome to your brand-new website generated with SiteStruck.</p>
    ${sections.includes("About") ? `<a class="btn" href="about.html">Learn more</a>` : ``}
  </div>
</section>
<div class="container" style="padding:26px 0">
  <div class="grid">
    <div class="card"><h3>Fast</h3><p>Built in seconds.</p></div>
    <div class="card"><h3>Simple</h3><p>No code required.</p></div>
    <div class="card"><h3>Responsive</h3><p>Works on any device.</p></div>
  </div>
</div>
${footer}
</body></html>`.trim();

  const about = `
<!DOCTYPE html><html lang="en"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>About - ${name}</title><link rel="stylesheet" href="style.css">
</head><body>
${header}
<div class="container" style="padding:26px 0">
  <h1>About</h1>
  <p>This page tells your story. Edit this content as you wish.</p>
</div>
${footer}
</body></html>`.trim();

  const contact = `
<!DOCTYPE html><html lang="en"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Contact - ${name}</title><link rel="stylesheet" href="style.css">
</head><body>
${header}
<div class="container" style="padding:26px 0">
  <h1>Contact</h1>
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
${footer}
</body></html>`.trim();

  const blog = `
<!DOCTYPE html><html lang="en"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Blog - ${name}</title><link rel="stylesheet" href="style.css">
</head><body>
${header}
<div class="container" style="padding:26px 0">
  <h1>Blog</h1>
  <div class="grid">
    <div class="card"><h3>First post</h3><p>Replace with your content.</p></div>
    <div class="card"><h3>Second post</h3><p>Replace with your content.</p></div>
    <div class="card"><h3>Third post</h3><p>Replace with your content.</p></div>
  </div>
</div>
${footer}
</body></html>`.trim();

  const zip = new JSZip();
  zip.file("style.css", css);
  zip.file("index.html", home);
  if (sections.includes("About")) zip.file("about.html", about);
  if (sections.includes("Contact")) zip.file("contact.html", contact);
  if (sections.includes("Blog")) zip.file("blog.html", blog);

  const blob = await zip.generateAsync({ type: "blob" });
  const url = URL.createObjectURL(blob);
  const dl = document.createElement("a");
  dl.href = url;
  dl.download = `${name.replace(/\s+/g,"_").toLowerCase()}_site.zip`;
  dl.click();
}
