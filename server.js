const express = require("express");
const cors = require("cors");
const sql = require("mssql");
const { dbconfig } = require("./dbconfig");
const app = express();
console.log("starting sql");
const path = require("path");
const dotenv = require("dotenv");
dotenv.config();
require("es6-promise").polyfill();
require("isomorphic-fetch");

app.use(cors());
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  next();
});

const nodemailer = require("nodemailer");
const creds = require("./mailconfig");

// var transport = {
//   host: "smtp.gmail.com",
//   port: creds.PORT,
//   secure: true, // upgrade later with STARTTLS
//   auth: {
//     user: creds.USER,
//     pass: creds.PASS,
//   },
//   tls: { rejectUnauthorized: false },
// };

var transport = {
  host: "smtp.zoho.com",
  port: 465,
  secure: true, // use SSL
  auth: {
    user: creds.USER,
    pass: creds.PASS,
  },
  tls: {
    // do not fail on invalid certs
    rejectUnauthorized: false,
  },
};

var transporter = nodemailer.createTransport(transport);

transporter.verify((error, success) => {
  if (error) {
    console.log("error in transporter verification: ", error);
  } else {
    console.log("All works fine, congratz!");
  }
});

app.use(express.static(path.join(__dirname, "build")));

app.get("/*", (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

app.get("/checkCaptcha", async function (req, res) {
  const RECAPTCHA_SERVER_KEY = process.env.RECAPTCHA_SERVER_KEY;
  const humanKey = req.query.key;
  const isHuman = await fetch(
    `https://www.google.com/recaptcha/api/siteverify`,
    {
      method: "post",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/x-www-form-urlencoded; charset=utf-8",
      },
      body: `secret=${RECAPTCHA_SERVER_KEY}&response=${humanKey}`,
    }
  )
    .then((res) => res.json())
    .then((json) => json.success)
    .catch((err) => {
      return false;
      // throw new Error(`Error in Google Siteverify API. ${err.message}`);
    });
  res.send(isHuman);
});
// Validate Human

app.post("/sendFeedback", async function (req, res) {
  // make sure that any items are correctly URL encoded in the connection string
  let conn = await saveResponseFromUser(req);

  //insert code to check whether data in inserted in database
  //
  console.log(conn);
  if (conn.rowsAffected[0] === 1) {
    sendEmail(req.query.Email);
  }
  res.send(conn);
});

function saveResponseFromUser(req) {
  return new Promise((resolve) => {
    new sql.ConnectionPool(dbconfig())
      .connect()
      .then((pool) => {
        return pool
          .request()
          .input("UserName", sql.VarChar, req.query.UserName)
          .input("Email", sql.VarChar, req.query.Email)
          .input("Qes1", sql.VarChar, req.query.Qes1)
          .input("Opt1_1", sql.VarChar, req.query.Opt1_1)
          .input("Opt2_1", sql.VarChar, req.query.Opt2_1)
          .input("Opt3_1", sql.VarChar, req.query.Opt3_1)
          .input("Opt4_1", sql.VarChar, req.query.Opt4_1)
          .input("Qes2", sql.VarChar, req.query.Qes2)
          .input("Opt1_2", sql.VarChar, req.query.Opt1_2)
          .input("Opt2_2", sql.VarChar, req.query.Opt2_2)
          .input("Opt3_2", sql.VarChar, req.query.Opt3_2)
          .input("Opt4_2", sql.VarChar, req.query.Opt4_2)
          .input("Opt5_2", sql.VarChar, req.query.Opt5_2)
          .input("Opt6_2", sql.VarChar, req.query.Opt6_2)
          .input("Opt7_2", sql.VarChar, req.query.Opt7_2)
          .input("Qes3", sql.VarChar, req.query.Qes3)
          .input("Opt1_3", sql.VarChar, req.query.Opt1_3)
          .input("Opt2_3", sql.VarChar, req.query.Opt2_3)
          .input("Opt3_3", sql.VarChar, req.query.Opt3_3)
          .input("Opt4_3", sql.VarChar, req.query.Opt4_3)
          .input("Opt5_3", sql.VarChar, req.query.Opt5_3)
          .input("Qes4", sql.VarChar, req.query.Qes4)
          .input("Des_1", sql.VarChar, req.query.Des_1)
          .input("Des_2", sql.VarChar, req.query.Des_2)
          .input("Des_3", sql.VarChar, req.query.Des_3)
          .input("Des_4", sql.VarChar, req.query.Des_4)
          .execute("udspUserFeedbackInsert");
      })
      .then((recordset) => {
        console.log(recordset);
        resolve(recordset);
        sql.close();
      })
      .catch((err) => {
        console.log(err);
        sql.close();
      });
  });
}

function sendEmail(emailID) {
  const email = emailID;
  const message = "Thank you for your feedback !!";

  var mail = {
    to: email,
    subject: "TEST SUBJECT",

    html: message,
  };

  transporter.sendMail(mail, (err, data) => {
    let responseData = {
      err: err,
      data: data,
    };
    if (err) {
      // res.json({
      //   msg: responseData,
      // });
      console.log("ERROR :", err);
    } else {
      // res.json({
      //   msg: "success",
      // });
      console.log("SUCCESS :", success);
    }
  });
}

app.get("/getFeedback", (req, res) => {
  res.send("DB Connected");
});

app.listen(process.env.PORT || 5000);
