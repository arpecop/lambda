const cheerio = require("cheerio");
const request = require("request-promise");
const async = require("async");
// eslint-disable-next-line prefer-destructuring
const html2json = require("html2json").html2json;

//const db = levelup(leveldown("/tmp/mydb123232323"));
const sanitizeHtml = require("sanitize-html");

function sanitize() {
  return new Promise((resolve) => {
    request.get(
      "https://techcrunch.com/wp-json/tc/v1/magazine?page=1&_embed=true&cachePrevention=0",
      (e, x, body) => {
        const json = JSON.parse(body);
        const filtered = json.map((item) => {
          const x = item;
          x.content.rendered = html2json(
            sanitizeHtml(item.content.rendered, {
              allowedTags: ["b", "i", "em", "p"],
            })
          );
          return x;
        });

        resolve(filtered);
      }
    );
  });
}

async function go(params, callback) {
  const filtered = await sanitize();

  callback(filtered);
}
// EMPdsada
if (!process.env.PORT) {
  go({}, (data) => {
    console.log(data);
  });
}
module.exports = {
  go,
};
