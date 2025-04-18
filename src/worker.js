import core from "./core.js";

function generateText(obj) { // string
  let courseTable = core.generateCourseTableText(obj);
  let countTable = core.generateCountTableText(obj);

  let text =
`NOW: ${obj.current_time.toFormat("EEEE, MM/dd HH:mm:ss, yyyy")}

${obj.today_is_passed ? "TOMORROW" : "TODAY"} CLASSES
-------------${obj.today_is_passed ? "---" : ""}
${courseTable ? courseTable : "Nothing"}
${obj.today_left_classes} class${obj.today_left_classes > 1 ? "es" : ""} left today.

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
      course.course_table = core.generateCourseTableArray(course);
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
