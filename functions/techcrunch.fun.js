const cheerio = require("cheerio");
const request = require("request-promise");
const async = require("async");
// eslint-disable-next-line prefer-destructuring
const html2json = require("html2json").html2json;
const { post } = require("./src/db.js");
const sanitizeHtml = require("sanitize-html");
var AWS = require("aws-sdk");
var translate = new AWS.Translate();

function sanitize() {
  return new Promise((resolve) => {
    request.get(
      "https://techcrunch.com/wp-json/tc/v1/magazine?page=1&_embed=true&cachePrevention=0",
      (e, x, body) => {
        const json = JSON.parse(body);
        const arr = [];
        async.each(
          json,
          function (item, callback) {
            translate.translateText(
              {
                Text: item.content.rendered,
                SourceLanguageCode: "en",
                TargetLanguageCode: "bg",
              },
              function (err, data) {
                if (data) {
                  callback();
                  arr.push({ ...item, content: data });
                } else {
                  callback();
                }
              }
            );
          },
          function (err, result) {
            const filtered = arr.map((item) => {
              const x = item;
              x.content.rendered = html2json(
                sanitizeHtml(item.content.TranslatedText, {
                  allowedTags: ["b", "i", "em", "p"],
                })
              );
              return x;
            });
            const minified = filtered.map((item) => {
              return {
                content: item.content.rendered.child,
                image: item.jetpack_featured_media_url,
                shortlink: item.shortlink,
                slug: item.slug,
                title: item.title.rendered,
                id: item.id,
                date: item.date,
              };
            });

            resolve(minified);
          }
        );
      }
    );
  });
}

async function go(params, callback) {
  const filtered = await sanitize();
  filtered.forEach(async (element) => {
    const x = await post(element, "TechCrunch");
    console.log(x);
  });

  callback(filtered);
}
// EMPdsada
if (!process.env.PORT) {
  go({}, (data) => {
    console.log(JSON.stringify(data[0]));
  });
}
module.exports = {
  go,
};
