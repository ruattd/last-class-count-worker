const datetime = document.getElementById("datetime");
const table = document.getElementById("table");
const left = document.getElementById("left");

setInterval(() => {
    if (datetime) {
        const d = new Date();
        datetime.innerHTML = "[当前时间] " + d.toLocaleString();
    }
}, 500);
