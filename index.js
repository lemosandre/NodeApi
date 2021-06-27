import express from "express";
import bodyParser from "body-parser";
import knex from "knex";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
import swaggerJsDoc from "swagger-jsdoc";
import swaggerUI from "swagger-ui-express";

const PORT = process.env.PORT || 8000;

const app = express();

const swaggerOptions = {
  swaggerDefinition: {
    info: {
      title: "Encurtador URL",
      version: "1.0.0",
    },
  },
  apis: ["index.js"],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

app.set("view engine", "ejs");

const db = knex({
  client: "mysql",
  connection: {
    user: "45daiYA0hm",
    password: "XQMIp8Qs17",
    database: "45daiYA0hm",
    host: "remotemysql.com",
  },
});

app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerDocs));
app.use(bodyParser.urlencoded({ extended: true }));

/**
 * @swagger
 * /:
 *  post:
 *    description: Insert the URL
 *    parameters:
 *       - url: url
 *         description: Url
 *         in: formData
 *         required: true
 *    responses:
 *       200:
 *         description: Url salva
 *       400:
 *            description: It's bad request
 *       500:
 *            description: It's internal server error
 */
app.post("/", (req, res) => {
  const url = req.body.url;
  db("urls_table")
    .insert({ url })
    .then((ids) => {
      res.redirect("/?alias=" + ids[0]);
    })
    .catch((e) => console.log(e));
});

/**
 * @swagger
 * /:alias:
 *   get:
 *     description: Get Url
 *     produces:
 *       - application/json
 *     parameters:
 *       - id: id
 *         description: url id
 *         in: formData
 *         required: true
 *     responses:
 *       200:
 *         description: Return saved user
 */

app.get("/:alias", (req, res, next) => {
  const alias = req.params.alias;
  if (!isNaN(alias)) {
    db.select("url")
      .from("urls_table")
      .where({ id: alias })
      .first()
      .then((urlRow) => {
        res.redirect(urlRow.url);
      })
      .catch((e) => console.log(e));
  } else {
    next();
  }
});

/**
 * @swagger
 * /:
 *   get:
 *     description: Preperando VIew
 *     responses:
 *       200:
 *         description: View in ejs
 */
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
