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

let times = [
  "08:30", "09:20", "10:20", "11:10", "11:50",
  "15:10", "16:00", "17:10", "17:50",
  "19:40", "21:10"
];

function getNow() {
  return DateTime.now().setZone("Asia/Shanghai");
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
    let name = map[item];
    if (currentIndex === index) name = "[" + name + "]";
    table.push(name);
  });
  return table.join(" ");
}

function generate() {
  let now = getNow();
  let todayCourse = getCourseArray(now);
  let currentTimeIndex = times.findIndex(item => DateTime.fromFormat(item, "HH:mm", { zone: "Asia/Shanghai" }) > now);
  let lastCourseCount = todayCourse ? times.length - currentTimeIndex : 0;
  
  let countMap = {};
  Object.keys(map).forEach(key => countMap[key] = 0);
  let countingDate = now;
  let countingCourse = getCourseArray(now, currentTimeIndex);
  while (true) {
    while (countingCourse) {
      countingCourse.forEach(item => countMap[item]++);
      countingDate = countingDate.plus({ days: 1 });
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

  let text =
`NOW: ${now.toFormat("EEEE, MM/dd HH:mm:ss, yyyy")}

TODAY CLASSES
-------------
${todayCourse ? toCourseTable(todayCourse, currentTimeIndex) : "Nothing"}
${lastCourseCount} class${lastCourseCount > 1 ? "es" : ""} left today.

LAST COUNT
----------
${countTextArray.join("\n")}
(by ${countingDate.plus({ days: -1 }).toFormat("MM/dd, yyyy")})
`;
  return text;
}

export default {
  async fetch(request, env, ctx) {
    return new Response(generate());
  },
};
