// Generator logic (requires JSZip loaded in generator.html)
document.addEventListener("DOMContentLoaded", ()=>{
  const u = window.getCurrentUser && window.getCurrentUser();
  const select = document.getElementById("owned-site");
  const form = document.getElementById("generator-form");
  const preview = document.getElementById("preview");
  const result = document.getElementById("result");

  if(!u || !select || !form) return;

  // Populate user sites
  (u.sites||[]).forEach(s=>{
    const opt = document.createElement("option");
    opt.value = s.id; opt.textContent = `${s.name} (${s.plan})`;
    select.appendChild(opt);
  });
  if(!u.sites || u.sites.length===0){
    select.innerHTML = "<option value=''>No sites yet — buy a plan first</option>";
    select.disabled = true;
    form.querySelector("button[type=submit]").disabled = true;
    return;
  }

  form.addEventListener("submit", async (e)=>{
    e.preventDefault();
    const name = document.getElementById("site-name").value.trim()||"My Site";
    const color = document.getElementById("main-color").value||"#4caf50";
    const font  = document.getElementById("font-family").value||"Arial";
    const sections = Array.from(document.querySelectorAll('input[name="sections"]:checked')).map(x=>x.value);

    // CSS
    const genCss = `
:root { --brand: ${color}; --brand-dark: #2f7d35; --text:#222; --muted:#666; --card:#fff; }
*{box-sizing:border-box}
body{margin:0;font-family:${font},system-ui,Arial,sans-serif;color:var(--text);background:#f7f7f7}
header{background:#1e1e1e;color:#eee;padding:14px 22px;display:flex;justify-content:space-between;align-items:center}
nav a{color:#ddd;text-decoration:none;margin-left:16px;font-weight:700} nav a:hover{color:#fff}
.container{width:min(1100px,92%);margin:0 auto;padding:26px 0}
.hero{padding:80px 0;background:linear-gradient(120deg,var(--brand),var(--brand-dark));color:#fff;text-align:center}
.btn{display:inline-block;background:#fff;color:#111;padding:10px 16px;border-radius:10px;text-decoration:none;font-weight:800}
.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:18px}
.card{background:var(--card);border-radius:12px;padding:18px;box-shadow:0 8px 20px rgba(0,0,0,.08)}
footer{background:#202020;color:#ccc;text-align:center;padding:18px;margin-top:40px}
@media (max-width:900px){.grid{grid-template-columns:1fr 1fr}}
@media (max-width:640px){.grid{grid-template-columns:1fr}}
`.trim();

    const headerHtml = `
<header>
  <div><strong>${name}</strong></div>
  <nav>
    <a href="index.html">Home</a>
    ${sections.includes("About") ? `<a href="about.html">About</a>` : ``}
    ${sections.includes("Contact") ? `<a href="contact.html">Contact</a>` : ``}
    ${sections.includes("Blog") ? `<a href="blog.html">Blog</a>` : ``}
  </nav>
</header>`.trim();

    const footerHtml = `<footer><p>&copy; ${new Date().getFullYear()} ${name}. All rights reserved.</p></footer>`;

    const homeSection = `
<section class="hero">
  <div class="container">
    <h1>${name}</h1>
    <p>Welcome to your brand-new website generated with SiteStruck.</p>
    <a class="btn" href="${sections.includes("About")?"about":"contact"}.html">Learn more</a>
  </div>
</section>
<div class="container">
  <div class="grid">
    <div class="card"><h3>Fast</h3><p>Built in seconds.</p></div>
    <div class="card"><h3>Simple</h3><p>No code required.</p></div>
    <div class="card"><h3>Responsive</h3><p>Works on any device.</p></div>
  </div>
</div>`.trim();

    const genIndex = `
<!DOCTYPE html><html lang="en"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Home - ${name}</title><link rel="stylesheet" href="style.css">
</head><body>${headerHtml}${homeSection}${footerHtml}</body></html>`.trim();

    const genAbout = `
<!DOCTYPE html><html lang="en"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>About - ${name}</title><link rel="stylesheet" href="style.css">
</head><body>${headerHtml}
<div class="container"><h1>About</h1><p>Tell your story here.</p></div>${footerHtml}</body></html>`.trim();

    const genContact = `
<!DOCTYPE html><html lang="en"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Contact - ${name}</title><link rel="stylesheet" href="style.css">
</head><body>${headerHtml}
<div class="container"><h1>Contact</h1><div class="card" style="max-width:520px;margin:16px 0;padding:16px;">
<form><div style="display:grid;gap:10px">
<input type="text" placeholder="Your name">
<input type="email" placeholder="Your email">
<textarea placeholder="Message" rows="6"></textarea>
</div><div style="margin-top:10px"><a class="btn" href="#">Send</a></div></form></div></div>${footerHtml}</body></html>`.trim();

    const genBlog = `
<!DOCTYPE html><html lang="en"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Blog - ${name}</title><link rel="stylesheet" href="style.css">
</head><body>${headerHtml}
<div class="container"><h1>Blog</h1>
<div class="grid"><div class="card"><h3>First post</h3><p>Replace with content.</p></div>
<div class="card"><h3>Second post</h3><p>Replace with content.</p></div>
<div class="card"><h3>Third post</h3><p>Replace with content.</p></div></div></div>${footerHtml}</body></html>`.trim();

    // Preview (simple)
    preview.classList.remove("hidden");
    preview.innerHTML = `<h3>Preview</h3><p>Site "<strong>${name}</strong>" with color ${color} and font ${font} will be generated.</p>`;

    // ZIP files
    const zip = new JSZip();
    zip.file("style.css", genCss);
    zip.file("index.html", genIndex);
    if(sections.includes("About")) zip.file("about.html", genAbout);
    if(sections.includes("Contact")) zip.file("contact.html", genContact);
    if(sections.includes("Blog")) zip.file("blog.html", genBlog);

    const blob = await zip.generateAsync({ type:"blob" });
    const url = URL.createObjectURL(blob);
    result.innerHTML = "";
    const a = document.createElement("a");
    a.href = url; a.download = name.replace(/\s+/g,"_").toLowerCase()+"_site.zip";
    a.className = "btn"; a.textContent = "Download ZIP";
    result.appendChild(a);
  });
});
