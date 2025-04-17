import { DateTime } from "luxon";

let map = {
  "Y": "语文",
  "M": "数学",
  "E": "英语",
  "C": "C语言",
  "D": "数据库",
  "Z": "组装",
  "P": "PS",
  "T": "体育",
  " ": "自习",
  "0": "NUL",
};

function getDate(text) {
  return DateTime.fromFormat(text, "yyyy-MM-dd", { zone: "Asia/Shanghai" });
}

let courses = [
  {
    start_date: getDate("2025-04-28"),
    end_date: getDate("2025-04-30"),
    list: [ "00000000000" ]
  },
  {
    start_date: getDate("2025-04-14"),
    end_date: getDate("2025-05-01"),
    list: [
      "CCYYEZT DPP",
      "YDEE PPMMCC",
      "CCEEMZZPPYY",
      "DYCC TMZMDD",
      "YYCE MM  EE",
      "DYMM MDD 00",
      "00000000 ZZ"
    ]
  }
];

let times_start = [
  "07:50", "08:40", "09:40", "10:30", "11:20",
  "14:30", "15:20", "16:30", "17:20",
  "19:00", "19:50"
];

let times = [
  "08:30", "09:20", "10:20", "11:10", "11:50",
  "15:10", "16:00", "17:10", "17:50",
  "19:40", "21:10"
];

function getNow() {
  // return getDate("2025-04-17");
  return DateTime.now().setZone("Asia/Shanghai");
}

function nextDay(datetime) {
  return datetime.plus({ days: 1 });
}

function getCourseArray(datetime, startIndex) {
  let currentPeriod = courses.find(item => datetime >= item.start_date && datetime <= item.end_date);
  if (!currentPeriod) return null;
  let dayDiff = datetime.diff(currentPeriod.start_date, "days").toObject().days;
  let index = Math.floor(dayDiff) % currentPeriod.list.length;
  let course = currentPeriod.list[index];
  let array = [];
  for (let i = startIndex ? startIndex : 0; i < course.length; i++) {
    array.push(course[i]);
  }
  return array;
}

function toCourseTable(courseArray, currentIndex) {
  let table = [];
  let index = -1;
  courseArray.forEach(item => {
    index++;
    if (item === "0") return;
    let content = `${times_start[index]}-${times[index]}  ${map[item]}`;
    if (currentIndex === index) content += " << current/next";
    table.push(content);
  });
  return table.join("\n");
}

function generate() {
  let now = getNow();
  let currentClassIndex = times.findIndex(item => DateTime.fromFormat(item, "HH:mm", { zone: "Asia/Shanghai" }) > now);
  let todayPassed = currentClassIndex === -1;
  if (todayPassed) currentClassIndex = times.length;
  let todayLeft = times.length - currentClassIndex;
  
  let countMap = {};
  Object.keys(map).forEach(key => countMap[key] = 0);
  let countingDate = now;
  let countingCourse = getCourseArray(now, currentClassIndex);
  while (true) {
    while (countingCourse) {
      countingCourse.forEach(item => countMap[item]++);
      countingDate = nextDay(countingDate);
      countingCourse = getCourseArray(countingDate);
    }
    let nextPeriod = courses.find(course => course.start_date >= countingDate);
    if (!nextPeriod) break;
    countingDate = nextPeriod.start_date;
    countingCourse = getCourseArray(countingDate);
  }

  delete countMap["0"];
  let countTextArray = [];
  Object.keys(map).forEach(key => {
    if (key !== "0") countTextArray.push(`${map[key]}:\t${countMap[key]}`)
  });

  let courseTableToShow = todayPassed ? toCourseTable(getCourseArray(nextDay(now))) : toCourseTable(getCourseArray(now), currentClassIndex);

  let text =
`NOW: ${now.toFormat("EEEE, MM/dd HH:mm:ss, yyyy")}

${todayPassed ? "TOMORROW" : "TODAY"} CLASSES
-------------${todayPassed ? "---" : ""}
${courseTableToShow ? courseTableToShow : "Nothing"}
${todayLeft} class${todayLeft > 1 ? "es" : ""} left today.

LAST COUNT
----------
${countTextArray.join("\n")}
(before ${countingDate.toFormat("MM/dd, yyyy")})

CREATE & DEPLOY BY @ruattd
ALL RIGHTS RESERVED.
`;
  return text;
}

export default {
  async fetch(request, env, ctx) {
    return new Response(generate());
  },
};
