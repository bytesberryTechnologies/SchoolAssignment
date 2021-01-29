const dotenv = require("dotenv");
dotenv.config();
module.exports = {
  //   USER: process.env.MAILER_USER,
  //   PASS: process.env.MAILER_PASS,
  //   PORT: process.env.MAILER_PORT,
  //   SMTP: process.env.MAILER_SMTP,
  type: process.env.Auth_type,
  user: process.env.Auth_user,
  clientId: process.env.Auth_clientId,
  clientSecret: process.env.Auth_clientSecret,
  refreshToken: process.env.Auth_refreshToken,
};
