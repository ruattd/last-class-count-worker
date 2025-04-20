import core from "./core.js";

function generateText(obj) { // string
  const courseTable = obj.today_is_passed ?
    core.toCourseTableText(obj.course_table_tomorrow) :
    core.toCourseTableText(obj.course_table, obj.current_class_index);
  const countTable = core.generateCountTableText(obj);

  let todayLeft = 0;
  if (!obj.today_is_passed && obj.course_table) {
    for (let i = 0; i < obj.course_table.length; i++) {
      if (obj.course_table[i] === "0") continue;
      if (i >= obj.current_class_index) todayLeft++;
    }
  }

  const text =
`NOW: ${obj.current_time.toFormat("EEEE, MM/dd HH:mm:ss, yyyy")}

${obj.today_is_passed ? "TOMORROW" : "TODAY"} CLASSES
-------------${obj.today_is_passed ? "---" : ""}
${courseTable ? courseTable : "Nothing"}
${todayLeft} class${todayLeft > 1 ? "es" : ""} left today.

LEFT COUNT
----------
${countTable}
(before ${obj.left_count_end.toFormat("MM/dd, yyyy")})

CREATE & DEPLOY BY @ruattd
ALL RIGHTS RESERVED.
`;

  return text;
}

function generateJsonResponse(object) {
  return new Response(JSON.stringify(object), {
    headers: { "Content-Type": "application/json" },
  });
}

export default {
  async fetch(request, env, ctx) {
    const path = new URL(request.url).pathname;

    if (path.startsWith("/api")) {
      if (path.startsWith("/api/times")) {
        return generateJsonResponse(core.getTimes())
      }
      let course = core.generateObject();
      course.course_table = core.toCourseTableArray(course.course_table);
      course.course_table_tomorrow = core.toCourseTableArray(course.course_table_tomorrow)
      course.current_time = course.current_time.toISO();
      course.left_count_end = course.left_count_end.toISODate();
      return generateJsonResponse(course);
    }
    if (path.startsWith("/text")) {
      return new Response(generateText(core.generateObject()), {
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    }

    return env.ASSETS.fetch(request);
  },
};
