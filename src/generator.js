document.addEventListener("DOMContentLoaded", () => {
    const generatorForm = document.getElementById("generator-form");
    if(generatorForm) {
        generatorForm.addEventListener("submit", function(e) {
            e.preventDefault();

            const name = document.getElementById("site-name").value;
            const color = document.getElementById("main-color").value;
            const font = document.getElementById("font-family").value;

            const sections = Array.from(document.querySelectorAll('input[name="sections"]:checked'))
                .map(el => el.value);

            document.getElementById("result").innerHTML = `
                <h3>Your Website:</h3>
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Main Color:</strong> ${color}</p>
                <p><strong>Font:</strong> ${font}</p>
                <p><strong>Sections:</strong> ${sections.join(", ")}</p>
            `;
        });
    }
});
