const input = document.getElementById("name-input");
const list = document.getElementById("names-list");
const count = document.getElementById("name-count");

// spinning ja nime valiku loogika
const canvas = document.getElementById("wheel-canvas");
const ctx = canvas.getContext("2d");
const spinButton = document.querySelector(".spin-button");
const modal = document.getElementById("winner-modal");
const winnerNameEl = document.getElementById("winner-name");
const closeModalBtn = document.getElementById("close-modal");
//

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



// spinning ja nime valiku loogika
const COLORS = ["#242322", "#909FA0", "#DCD7CC", "#AFA69C"];

let wheelNames = [];
let currentAngle = 0; // in degrees
let isSpinning = false;

/* Kuula main.js-i saadetud nimekirja muutusi */
document.addEventListener("names:changed", (e) => {
    wheelNames = e.detail.names;
    drawWheel();
});



/* draw ratta praeguse nurga (currentAngle) all */
function drawWheel() {
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const radius = Math.min(cx, cy) - 2; // ruumi 2px äärejoonele

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // kui list on tühi joonista ainult tühi 2px ring
    if (wheelNames.length === 0) {
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.fillStyle = "#DCD7CC";
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = "#242322";
        ctx.stroke();
        return;
    }

    // ühe sektori laius radiaanides (täisring 2pi jagatud nimede arvuga)
    const sliceRad = (Math.PI * 2) / wheelNames.length;

    // wheeli praegune pöördenurk kraadidest radiaanideks teisendatuna
    const rotationRad = (currentAngle * Math.PI) / 180;

    // drawi iga nime jaoks sektor
    wheelNames.forEach((name, i) => {
        // sectori algus/lõpp (-pi / 2 nihutab 0-punkti kella 3 pealt kella 12 peale)
        const startAngle = -Math.PI / 2 + rotationRad + i * sliceRad;
        const endAngle = startAngle + sliceRad;

        const bgColor = COLORS[i % COLORS.length];


        // draw sector
        ctx.beginPath();
        ctx.moveTo(cx, cy); // hakka keskpunktist
        ctx.arc(cx, cy, radius, startAngle, endAngle); // draw väliskaar algusnurgast lõppnurgani
        ctx.closePath(); // connecti kaare lõpp tagasi keskpunkti

        // fill color
        ctx.fillStyle = bgColor;
        ctx.fill();

        // nime joonistus loogika
        ctx.save(); // save state enne pööramist
        ctx.translate(cx, cy); // set coord nullpunkt (0, 0) ratta keskpunkti
        ctx.rotate(startAngle + sliceRad / 2); // keera koordinaatsüsteem täpselt sektori keskjoonele
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        ctx.fillStyle = bgColor === "#242322" ? "#EAE5DA" : "#242322"; // tumedal taustal hele tekst ja heledal tume
        ctx.font = "bold 24px Bricolage Grotesque";
        ctx.fillText(name, 60, 0);
        ctx.restore(); // taasta canvase algne olek järgmise sektori jaoks
    });

    //välimine 2px paksune ring
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#1e1e1e";
    ctx.stroke();

    // keskmine väike ring
    ctx.beginPath();
    ctx.arc(cx, cy, 24, 0, Math.PI * 2);
    ctx.fillStyle = "#e8e4dc";
    ctx.fill();
    ctx.lineWidth = 1;
    ctx.strokeStyle = "#1e1e1e";
    ctx.stroke();
}

/* loogika keerutamiseks */
function spinWheel() {
    if (isSpinning) return;

    if (wheelNames.length === 0) {
        winnerNameEl.textContent = "Nimekiri on tühi!";
        modal.showModal();
        return;
    }

    isSpinning = true;

    // vali suvaline võitja
    const winnerIndex = Math.floor(Math.random() * wheelNames.length);
    const winnerName = wheelNames[winnerIndex];

    // leia võitja sektori kraadide vahemik (nt 180 kuni 240 kui 6 nime)
    const sliceDeg = 360 / wheelNames.length;
    const sectorStart = winnerIndex * sliceDeg;
    const sectorEnd = sectorStart + sliceDeg;

    //vali suvaline kraad selle sektori seest (jättes 10% varu servadest)
    const padding = sliceDeg * 0.1;
    const randomDegInSector = sectorStart + padding + Math.random() * (sectorEnd - sectorStart - 2 * padding);

    //arvuta sihtnurk nii et valitud punkt jääks täpselt kella 12 alla (0deg)
    const targetMod = (360 - randomDegInSector) % 360;
    const currentMod = ((currentAngle % 360) + 360) % 360;
    const extraRotation = (targetMod - currentMod + 360) % 360;

    //täpselt 4 täisringi + vajalik osa (~0–1 ring) sihtkohani
    const totalRotation = 4 * 360 + extraRotation;
    const startAngle = currentAngle;
    const duration = 4000; // 4 sekundit
    const startTime = performance.now();

    function animate(now) {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // ease-out
        const eased = 1 - Math.pow(1 - progress, 4);

        currentAngle = startAngle + totalRotation * eased;
        drawWheel();

        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            // 0.3s ooteaeg enne modali avamist
            setTimeout(() => {
                winnerNameEl.textContent = winnerName;
                modal.showModal();
                confetti({
                    particleCount: 100,
                    spread: 70,
                    origin: { y: 0.6 },
                    colors: ["#242322", "#909FA0", "#DCD7CC", "#AFA69C", "#EAE5DA"] // need värvid võiksid sobida
                });
                isSpinning = false;
            }, 300);
        }
    }

    requestAnimationFrame(animate);
}

spinButton.addEventListener("click", spinWheel);
closeModalBtn.addEventListener("click", () => modal.close());
modal.addEventListener("click", (e) => {
    if (e.target === modal) modal.close();
});

/* Esmane joonistus lehe laadimisel */
render();