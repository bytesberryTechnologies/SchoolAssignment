const dotenv = require("dotenv");
dotenv.config();
module.exports = {
  USER: process.env.MAILER_USER,
  PASS: process.env.MAILER_PASS,
  PORT: process.env.MAILER_PORT,
  SMTP: process.env.MAILER_SMTP,
};
