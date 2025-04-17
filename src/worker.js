/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run "npm run dev" in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run "npm run deploy" to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

// const dayjs = require("./day.js")();

let map = {
  "Y": "语文",
  "M": "数学",
  "E": "英语",
  "C": "C语言",
  "D": "数据库",
  "Z": "组装",
  "P": "PS",
  "T": "体育",
}

let courses = [
  {
    start_date: "2025-04-14 CST",
    end_date: "2025-04-30 CST",
    list: [
      "CCYYEZT DPP",
      "YDEE PPMMCC",
      "CCEEMZZPPYY",
      "DYCC TMZMDD",
      "YYCE MM  EE",
      "DYMM MDD ",
      "ZZ"
    ]
  }
]

function next() {

}

// let response = `datetime ${dayjs.format()}`;

export default {
  async fetch(request, env, ctx) {
    return new Response(response);
  },
};