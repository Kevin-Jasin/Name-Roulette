const input = document.getElementById("name-input");
const list = document.getElementById("names-list");
const count = document.getElementById("name-count");

/* Nimede list */
let names = []

/* Renderib kõik nimed visuaalselt listis */
function render() {
    list.innerHTML = ""; // tühjenda vana list
    names.forEach((name, i) => {
        // loo üks rida: järjekorranumber, nimi, eemaldamisnupp
         // nimi pannakse textContent'iga (turvaline, ei tõlgenda HTML-i)
        const li = document.createElement("li");
        li.className = "name-item";
        li.innerHTML = `
            <span class="name-index">${String(i + 1).padStart(2, "0")}</span>
            <span class="person-name"></span>
            <button type="button" class="remove-name" data-index="${i}">x</button>`;
        li.querySelector(".person-name").textContent = name;
        list.append(li);
    });
    count.textContent = `${names.length} nime rattal` // uuenda loendurit
    // anna teistele skriptidele teada, et nimekiri muutus
    document.dispatchEvent(new CustomEvent("names:changed", {detail: { names }}));
}

/* Lisab nime listi (Ei arvesta praegu suure või väikse tähega) */
function addName() {
    const name = input.value.trim();
    if (name && !names.includes(name)) names.push(name);
    input.value = "";
    render()
}

/* Kui vajutada "ENTER" või add-button'it, siis kutsub func addName */
document.getElementById("add-button").addEventListener("click", addName);
input.addEventListener("keydown", e => { if (e.key == "Enter") addName(); });

/* Eemaldab nime: click nupule loeb data-index ja kustutab selle nime massiivist */
list.addEventListener("click", e => {
    if (e.target.classList.contains("remove-name")) {
        names.splice(e.target.dataset.index, 1);
        render();
    }
});

/* Tühjendab kogu nimekirja */
document.getElementById("clear-button").addEventListener("click", () => {
    names = [];
    render();
});

/* Täidab nimekirja näidisnimedega */
document.getElementById("sample-button").addEventListener("click", () => {
    names = ["Aino", "Mart", "Liisa", "Jaan", "Kadri", "Tõnu"];
    render();
});

/* Esmane joonistus lehe laadimisel */
render();