const API_ADDR = "/api";
const ZONE = "Asia/Shanghai";
const TIME_FORMAT = "HH:mm";

const datetime = document.getElementById("datetime");
const day = document.getElementById("day");
const table = document.getElementById("table");
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
    day.innerHTML = data.today_is_passed ? "明日" : "今日";
    let courseTableArray = [];
    let index = -1;
    data.course_table.forEach(item => {
        index++;
        if (item === "NUL") return;
        let start = DateTime.fromISO(times.start_times[index]).toFormat(TIME_FORMAT);
        let end = DateTime.fromISO(times.end_times[index]).toFormat(TIME_FORMAT);
        let text = `${start}-${end} ${item}`;
        courseTableArray.push(text);
    });
    table.innerHTML = courseTableArray.join("<br />");
}

fetch(`${API_ADDR}/times`).then(response => {
    response.json().then(times => {
        setInterval(() => {
            let currentIndex = times.end_times.findIndex(time => {
                const t = DateTime.fromISO(time);
                return now > t;
            });
            if (currentIndex <= lastRequestIndex) return;
            lastRequestIndex = currentIndex;
            onUpdate(times);
            fetch(`${API_ADDR}`).then(response => response.json().then(data => onUpdate(data, times)));
        }, 1000);
    });
});
