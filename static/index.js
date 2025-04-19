const DateTime = luxon.DateTime;

const API_ADDR = "/api";
const ZONE = "Asia/Shanghai";
const LOCALE = "zh-CN";
const TIME_FORMAT = "HH:mm";

const countdownTarget = DateTime.fromISO("2025-05-10T09:00:00.000+08:00");

const datetime = document.getElementById("datetime");
const day = document.getElementById("day");
const table = document.getElementById("table");
const left_today = document.getElementById("left-today");
const left_days = document.getElementById("left-days");
const left = document.getElementById("left");
const count_end = document.getElementById("count-end");

let now;
let lastRequestIndex = -2;

setInterval(() => {
    now = DateTime.now().setZone(ZONE);
    const datetimeStr = now.toFormat("EEEE DDD TT", { locale: LOCALE });
    if (datetime.innerHTML != datetimeStr) datetime.innerHTML = datetimeStr;
    const countdown = countdownTarget.diff(now, [ "days", "hours", "minutes", "seconds" ]);
    const countdownStr = countdown.toFormat("d 天 h 小时 m 分钟 s 秒");
    if (left_days.innerHTML != countdownStr) left_days.innerHTML = countdownStr;
}, 200);

async function onUpdate(data, times) {
    left_today.innerHTML = data.today_left_classes;
    const todayPassed = data.today_is_passed;
    const courseTable = todayPassed ? data.course_table_tomorrow : data.course_table;
    day.innerHTML = todayPassed ? "明日" : "今日";
    let courseTableArray = [];
    let index = -1;
    courseTable.forEach(item => {
        index++;
        if (item === "NUL") return;
        let start = times.start_times[index].toFormat(TIME_FORMAT);
        let end = times.end_times[index].toFormat(TIME_FORMAT);
        let time = `<span class="time">${start}-${end}</span>`
        if (!data.today_is_passed && data.current_class_index === index) {
            item = `<span id="current" class="current next">${item}</span>`
            const start_next = times.start_times[index];
            if (start_next) {
                const updater = setInterval(() => {
                    if (now > start_next) {
                        document.getElementById("current").className = "current";
                        clearInterval(updater);
                    }
                }, 1000);
            }
        }
        courseTableArray.push(`<tr><td class="class">${item}</td><td>${time}</td></tr>`);
    });
    table.innerHTML = `<table><tbody>${courseTableArray.join("")}</tbody></table>`
    let leftClassesArray = [];
    Object.keys(data.left_count).forEach(key => {
        let text = `<tr><td>${key}</td><td class="time">${data.left_count[key]}</td></tr>`;
        leftClassesArray.push(text);
    })
    left.innerHTML = `<table><tbody>${leftClassesArray.join("")}</tbody></table>`;
    count_end.innerHTML = DateTime.fromISO(data.left_count_end).plus({ days: -1 }).toFormat("yyyy/MM/dd", { locale: LOCALE });
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
