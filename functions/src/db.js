const fetch = require("node-fetch");
function post(json, table) {
  return new Promise((resolve, reject) => {
    fetch("https://rudixdb.herokuapp.com/v1/query", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-hasura-admin-secret": process.env.password,
      },
      body: JSON.stringify({
        type: "insert",
        args: {
          table: { name: table, schema: "public" },
          objects: [json],
          returning: [],
        },
      }),
    })
      .then((result) => {
        return result.json();
      })
      .then((data) => {
        resolve(data);
      });
  });
}
module.exports = { post };
