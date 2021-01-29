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
  host: "smtppro.zoho.com",
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
  let message =
    "<b style='font-size:16px;'>Hi,</b><br/><p style='text-align:center; font-size:16px;'><b>Greetings from Bytesberry Technologies!!!</b></p><p style='font-size:16px; text-align:justify;'>Thank you for your response. We as a Tech firm and are committed to work in the education space in providing digital solutions to help out Teachers and School Administrators for improving the quality of education being imparted.<br/><br/>As our first endeavour, we have chosen Student’s Assignments as the priority to come up with a solution to meet this challenge head-on.<br/><br/>We will keep you posted on the progress. Please feel free to contact the numbers mentioned below for any queries.<br/><br/><br/><br/>Thank you.<br/><br/><br/>Bytesberry Technologies<br/>Basnett Building<br/>D.P.H. road, Behind Janta Bhawan<br/>Gangtok, East<br/>Sikkim – 737101<br/>Contact #: 85973-55169 / 98327-81875<br/>Email address: kripa@bytesberry.com / mrinaldeep@bytesberry.com<br/><br/><br/></p>";
  message +=
    "<small style='text-align:justify;'>This is an auto generated email and any files transmitted with it are confidential and intended solely for the use of the individual or entity to whom they are addressed. If you have received this email in error please notify the system manager. This message contains confidential information and is intended only for the individual named. If you are not the named addressee, kindly don not disseminate, distribute or copy this e-mail. Please notify the sender immediately by e-mail if you have received this e-mail by mistake and delete this e-mail from your system.</small>";

  var mail = {
    from: "Bytesberry Technologies <" + creds.USER + ">",
    to: email,
    subject: "Student’s Assignments – Its Challenges & Solutions",
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
