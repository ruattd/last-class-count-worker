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
const update_time = document.getElementById("update-time");

let now;
let lastRequestFinished = true;
let lastRequestIndex = -2;

function onTimeUpdate() {
    now = DateTime.now().setZone(ZONE);
    const datetimeStr = now.toFormat("EEEE DDD TT", { locale: LOCALE });
    if (datetime.innerHTML != datetimeStr) datetime.innerHTML = datetimeStr;
    const countdown = countdownTarget.diff(now, [ "days", "hours", "minutes", "seconds" ]);
    const countdownStr = countdown.toFormat("d 天 h 小时 m 分钟 s 秒");
    if (left_days.innerHTML != countdownStr) left_days.innerHTML = countdownStr;
}

function onUpdate(data) {
    const todayPassed = data.today_is_passed;
    const courseTable = todayPassed ? data.course_table_tomorrow : data.course_table;
    day.innerHTML = todayPassed ? "明日" : "今日";
    let courseTableArray = [];
    let index = -1;
    let todayLeft = 0;
    courseTable?.forEach(item => {
        index++;
        if (item === "NUL") return;
        let start = data.start_times[index].toFormat(TIME_FORMAT);
        let end = data.end_times[index].toFormat(TIME_FORMAT);
        let time = `<span class="time">${start}-${end}</span>`
        if (!data.today_is_passed && data.current_class_index === index) {
            item = `<span id="current" class="current next">${item}</span>`
            const start_next = data.start_times[index];
            if (start_next) {
                const updater = setInterval(() => {
                    if (now > start_next) {
                        document.getElementById("current").className = "current";
                        clearInterval(updater);
                    }
                }, 200);
            }
        }
        if (!todayPassed && data.current_class_index <= index) todayLeft++;
        courseTableArray.push(`<tr><td class="class">${item}</td><td>${time}</td></tr>`);
    });
    if (courseTableArray.length > 0) table.innerHTML = `<table><tbody>${courseTableArray.join("")}</tbody></table>`
    left_today.innerHTML = todayLeft;
    let leftClassesArray = [];
    Object.keys(data.left_count).forEach(key => {
        let text = `<tr><td>${key}</td><td class="time">${data.left_count[key]}</td></tr>`;
        leftClassesArray.push(text);
    })
    left.innerHTML = `<table><tbody>${leftClassesArray.join("")}</tbody></table>`;
    count_end.innerHTML = data.left_count_end.plus({ days: -1 }).toFormat("yyyy/MM/dd", { locale: LOCALE });
    update_time.innerHTML = data.current_time.toFormat("M/dd HH:mm:ss", { locale: LOCALE });
}

function onCheckUpdate(times) {
    const end_times = times.end_times;
    const currentIndex = end_times.findIndex(time => now < time);
    const lastIndex = currentIndex === -1 ? end_times.length - 1 : currentIndex - 1;
    if (currentIndex <= lastRequestIndex && (currentIndex !== -1 || lastRequestIndex === -1)) return;
    if (lastRequestFinished) {
        lastRequestFinished = false;
        console.log("Triggered update, fetch data from API", { last_request: lastRequestIndex, current: currentIndex });
        fetch(`${API_ADDR}`)
        .finally(() => {
            lastRequestFinished = true;
        })
        .then(response => response.json())
        .then(data => {
            console.log("New data: ", structuredClone(data));
            data.current_time = DateTime.fromISO(data.current_time);
            if (lastIndex >= 0 && data.current_time < end_times[lastIndex]) return;
            data.left_count_end = DateTime.fromISO(data.left_count_end);
            onUpdate({ ...data, ...times });
            console.log("Updated");
            lastRequestIndex = currentIndex;
        });
    }
}

onTimeUpdate()
setInterval(() => onTimeUpdate(), 200);

console.log("Fetch times from API");
fetch(`${API_ADDR}/times`)
.then(response => response.json())
.then(times => {
    console.log("Times: ", structuredClone(times));
    for (let i = 0; i < times.start_times.length && i < times.end_times.length; i++) {
        times.start_times[i] = DateTime.fromISO(times.start_times[i]);
        times.end_times[i] = DateTime.fromISO(times.end_times[i]);
    }
    onCheckUpdate(times);
    setInterval(() => onCheckUpdate(times), 1000);
});
