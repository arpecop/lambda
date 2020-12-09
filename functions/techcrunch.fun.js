const cheerio = require("cheerio");
const request = require("request-promise");
const async = require("async");
// eslint-disable-next-line prefer-destructuring
const html2json = require("html2json").html2json;

const sanitizeHtml = require("sanitize-html");
const { AWSTranslateJSON } = require("aws-translate-json");
const awsConfig = {
  accessKeyId: process.env.AWS_TRANSLATE_ID,
  secretAccessKey: process.env.AWS_TRANSLATE_SECRET,
  region: process.env.AWS_TRANSLATE_REGION,
};
const source = "en";
const taget = ["bg"];

const { translateJSON } = new AWSTranslateJSON(awsConfig, source, taget);

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
  });
}

async function go(params, callback) {
  const filtered = await sanitize();

  callback(filtered);
}
// EMPdsada
if (!process.env.PORT) {
  go({}, (data) => {
    console.log(data[0]);
  });

  translateJSON({
    key1: "my text here",
    key2: "other text",
    key3: {
      key4: "nested text",
    },
  }).then((data) => {
    console.log(data);
  });
}
module.exports = {
  go,
};
