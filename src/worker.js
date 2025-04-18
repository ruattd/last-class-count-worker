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

export default {
  async fetch(request, env, ctx) {
    const path = new URL(request.url).pathname;
    const course = core.generateObject();

    if (path.startsWith("/json")) {
      course.current_time = course.current_time.toISO();
      course.left_count_end = course.left_count_end.toISODate();
      return new Response(JSON.stringify(course), {
        headers: { "Content-Type": "application/json" },
      });
    } else if (path.startsWith("/text")) {
      return new Response(generateText(course), {
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    }
    return env.ASSETS.fetch(request);
  },
};
