const API_ADDR = "/api";
const ZONE = "Asia/Shanghai";
const TIME_FORMAT = "HH:mm";

const datetime = document.getElementById("datetime");
const day = document.getElementById("day");
const table = document.getElementById("table");
const left_today = document.getElementById("left-today");
const left = document.getElementById("left");

const DateTime = luxon.DateTime;

let datetimeString = "";
let now;
let lastRequestIndex = -2;

setInterval(() => {
    now = DateTime.now().setZone(ZONE);
    const datetimeStr = now.toFormat("EEEE DDD TT", { locale: "zh-CN" });
    if (datetimeString !== datetimeStr) {
        datetimeString = datetimeStr;
        datetime.innerHTML = datetimeStr;
    }
}, 200);

async function onUpdate(data, times) {
    left_today.innerHTML = data.today_left_classes;
    day.innerHTML = data.today_is_passed ? "明日" : "今日";
    let courseTableArray = [];
    let index = -1;
    data.course_table.forEach(item => {
        index++;
        if (item === "NUL") return;
        let start = times.start_times[index].toFormat(TIME_FORMAT);
        let end = times.end_times[index].toFormat(TIME_FORMAT);
        let text = `${start}-${end} ${item}`;
        if (!data.today_is_passed && data.current_class_index === index) {
            text = `<span id="current" class="current next">${text}</span>`
            const start_next = times.start_times[index];
            if (start_next) {
                const updater = setInterval(() => {
                    if (now > start_next) {
                        document.getElementById("current").className = "current";
                        clearInterval(updater);
                    }
                }, 1000);
            }
        } else {
            text = `<span>${text}</span>`;
        }
        courseTableArray.push(text);
    });
    table.innerHTML = courseTableArray.join("<br />");
    let leftClassesArray = [];
    Object.keys(data.left_count).forEach(key => {
        let text = `<tr><td>${key}</td><td class="number">${data.left_count[key]}</td></tr>`;
        leftClassesArray.push(text);
    })
    left.innerHTML = `<table><tbody>${leftClassesArray.join("")}</tbody></table>`;
}

console.log("Fetching times");
fetch(`${API_ADDR}/times`).then(response => {
    response.json().then(times => {
        for (let i = 0; i < times.start_times.length && i < times.end_times.length; i++) {
            times.start_times[i] = DateTime.fromISO(times.start_times[i]);
            times.end_times[i] = DateTime.fromISO(times.end_times[i]);
        }
        setInterval(() => {
            let currentIndex = times.end_times.findIndex(time => now > time);
            if (currentIndex <= lastRequestIndex) return;
            lastRequestIndex = currentIndex;
            fetch(`${API_ADDR}`).then(response => response.json().then(data => onUpdate(data, times)));
            console.log("Triggered update");
        }, 1000);
    });
});
