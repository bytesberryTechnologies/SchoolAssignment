const dotenv = require("dotenv");
dotenv.config();
const dbconfig = function () {
  const configuration = {
    server: "43.255.152.26",
    instance: process.env.REACT_APP_DB_INSTANCE,
    database: process.env.REACT_APP_DB_DATABASE,
    user: process.env.REACT_APP_DB_USER,
    password: process.env.REACT_APP_DB_PASSWORD,
  };

  return configuration;
};

module.exports = {
  dbconfig: dbconfig,
};
