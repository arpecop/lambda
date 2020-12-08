// const db = require('./_firebase.js');

const cluster = require("cluster");
const express = require("express");
const request = require("request");

const _ = require("underscore");

const swarm = ["lamb1", "lamb2", "lamb3", "lamb4", "lamb5"];
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");

const { q, lambda } = require("./_firebase.js");

if (cluster.isMaster) {
  cluster.fork();
  require("./cron");
  cluster.on("exit", () => {
    cluster.fork();
  });
} else {
  const port = process.env.PORT || 3001;
  // dsddasd
  app.use(cors());
  app.use(bodyParser.json());
  app.get("/", (req, res) => {
    res.end("ok");
  });

  app.get("/tmp/:id", async (req, res) => {
    res.sendFile(`/tmp/${req.params.id}`);
  });

  app.all("/la/:function", async (req, res) => {
    const worker = _.shuffle(swarm)[0];
    const payload = {
      ...req.query,
      ...req.body,
      ip: req.headers["x-forwarded-for"] || req.connection.remoteAddress,
      hostname: req.hostname,
    };
    if (process.env.main) {
      request.get(
        `https://${worker}.herokuapp.com${req.originalUrl}${
          Object.keys(payload).length > 0
            ? `?${Object.entries(payload)
                .map((e) => e.join("="))
                .join("&")}`
            : ""
        }`,
        (err, x, body) => {
          res.end(err ? "{ err: 1 }" : body);
        }
      );
    } else {
      lambda(req.params.function, payload, (params) => {
        res.end(typeof params === "object" ? JSON.stringify(params) : params);
      });
    }
  });

  app.get("/:collection/:limit", async (req, res) => {
    const extend =
      Object.keys(req.query).length > 0
        ? {
            nocache: req.query.nocache,
          }
        : {};
    res.send(
      await q({
        collection: req.params.collection,
        limit: Math.round(req.params.limit),
        ...extend,
      })
    );
  });

  app.listen(port);
}
//dsadsadssda
