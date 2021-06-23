import express from "express";
import ejs from "ejs";
import bodyParser from "body-parser";
import knex from "knex";
import yeast from "yeast";

const PORT = process.env.PORT || 8000;

const app = express();

app.set("view engine", "ejs");

const db = knex({
  client: "mysql",
  connection: {
    user: "root",
    password: "password",
    database: "nodeapidata",
    host: "localhost",
  },
});

app.use(bodyParser.urlencoded({ extended: true }));

app.post("/", (req, res) => {
  const url = req.body.url;
  db("urls_table")
    .insert({ url })
    .then((ids) => {
      const alias = yeast.encode(ids[0]);
      res.redirect("/?alias=" + alias);
    })
    .catch(console.log);
});

app.get("/:alias", (req, res, next) => {
  const alias = req.params.alias;
  if (alias) {
    db.select("url")
      .from("urls_table")
      .where({ id: yeast.decode(alias) })
      .first()
      .then((urlRow) => {
        res.redirect(urlRow.url);
      });
  } else {
    next();
  }
});

app.get("/", (req, res) => {
  const alias = req.query.alias;
  db.select("*")
    .from("urls_table")
    .then((shortUrls) => {
      res.render("index", {
        alias,
        PORT,
        shortUrls,
      });
    });
});

app.listen(PORT, () => console.log(`server started, listening PORT ${PORT}`));
