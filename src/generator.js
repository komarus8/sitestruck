document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("generator-form");
    const resultBox = document.getElementById("result");
    const downloadBtn = document.getElementById("downloadBtn");

    form.addEventListener("submit", function(e) {
        e.preventDefault();

        const name = document.getElementById("site-name").value;
        const color = document.getElementById("main-color").value;
        const font = document.getElementById("font-family").value;

        const sections = Array.from(document.querySelectorAll('input[name="sections"]:checked'))
            .map(el => el.value);

        const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${name}</title>
<link rel="stylesheet" href="style.css">
</head>
<body>
<header>
<h1>${name}</h1>
<nav>
<ul>
${sections.map(s => `<li><a href="#${s.toLowerCase()}">${s}</a></li>`).join("")}
</ul>
</nav>
</header>
<main>
${sections.map(s => `<section id="${s.toLowerCase()}"><h2>${s}</h2><p>Content for ${s}</p></section>`).join("")}
</main>
</body>
</html>
`;

        const cssContent = `
body {
    font-family: ${font}, sans-serif;
    color: #333;
    margin: 0;
    padding: 0;
}
header {
    background: ${color};
    color: #fff;
    padding: 20px;
    text-align: center;
}
nav ul {
    list-style: none;
    padding: 0;
}
nav ul li {
    display: inline;
    margin: 0 10px;
}
`;

        resultBox.innerHTML = `
<h3>Preview:</h3>
<pre><code>${htmlContent}</code></pre>
`;

        downloadBtn.style.display = "inline-block";

        downloadBtn.onclick = () => {
            const zip = new JSZip();
            zip.file("index.html", htmlContent);
            zip.file("style.css", cssContent);

            zip.generateAsync({ type: "blob" }).then(content => {
                saveAs(content, `${name.replace(/\s+/g, '_')}_website.zip`);
            });
        };
    });
});
