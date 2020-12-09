const { AWSTranslateJSON } = require("aws-translate-json");

const awsConfig = {
  accessKeyId: process.env.AWS_TRANSLATE_ID,
  secretAccessKey: process.env.AWS_TRANSLATE_SECRET,
  region: process.env.AWS_TRANSLATE_REGION,
};

const source = "en";
const taget = ["pt", "it", "es"];

const { translateJSON } = new AWSTranslateJSON(awsConfig, source, taget);

translateJSON({
  key1: "my text here",
  key2: "other text",
  key3: {
    key4: "nested text",
  },
}).then(console.log);
