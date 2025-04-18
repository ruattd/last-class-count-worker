const datetime = document.getElementById("datetime");
const day = document.getElementById("day");
const table = document.getElementById("table");
const left = document.getElementById("left");

setInterval(() => {
    if (datetime) {
        const d = new Date();
        datetime.innerHTML = d.toLocaleString();
    }
}, 500);
