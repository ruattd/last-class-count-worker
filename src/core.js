import { DateTime } from "luxon";

const map = {
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

function getDate(text) { // DateTime
  return DateTime.fromFormat(text, "yyyy-MM-dd", { zone: "Asia/Shanghai" });
}

const courses = [
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

const times_start = [
  "07:50", "08:40", "09:40", "10:30", "11:20",
  "14:30", "15:20", "16:30", "17:20",
  "19:00", "19:50"
];

const times = [
  "08:30", "09:20", "10:20", "11:10", "11:50",
  "15:10", "16:00", "17:10", "17:50",
  "19:40", "21:10"
];

const zone = "Asia/Shanghai"

function getTimesISO(times) { // string[]
  let timesISO = [];
  times.forEach(time => {
    let iso = DateTime.fromFormat(time, "HH:mm", { zone: zone }).toISOTime();
    timesISO.push(iso);
  });
  return timesISO;
}

function getTimes() { // {}
  return {
    start_times: getTimesISO(times_start),
    end_times: getTimesISO(times),
  }
}

function getNow() { // DateTime
  // return getDate("2025-04-17");
  return DateTime.now().setZone(zone);
}

function nextDay(datetime) { // DateTime
  return datetime.plus({ days: 1 });
}

function getCourseArray(datetime, startIndex) { // string[]
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

function toCourseTableArray(courseArray) {
  if (!courseArray) return [];
  let resultArray = [];
  courseArray.forEach(item => resultArray.push(map[item]));
  return resultArray;
}

function toCourseTableText(courseArray, currentIndex) { // string
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

function generateObject() { // {}
  let now = getNow();
  let currentClassIndex = times.findIndex(item => DateTime.fromFormat(item, "HH:mm", { zone: zone }) > now);
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
  let resultMap = {};
  Object.keys(countMap).forEach(key => resultMap[map[key]] = countMap[key]);

  return {
    current_time: now,  // DateTime
    current_class_index: currentClassIndex, // number
    today_is_passed: todayPassed, // boolean
    today_left_classes: todayLeft, // number
    left_count: resultMap, // object (map)
    left_count_end: countingDate, // DateTime
    course_table: getCourseArray(now),
    course_table_tomorrow: getCourseArray(nextDay(now)),
  };
}

function generateCountTableText(course_object) { // string
  let countTextArray = [];
  Object.keys(course_object.left_count).forEach(key => {
    countTextArray.push(`${key}:\t${course_object.left_count[key]}`)
  });
  return countTextArray.join("\n");
}

export default {
    generateObject,
    generateCountTableText,
    getTimes,
    toCourseTableArray,
    toCourseTableText,
};
