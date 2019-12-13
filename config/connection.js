var mysql = require("mysql");

var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "Lifeisacruelrefrain!16584",
    database: "team_DB"
  });

  
module.exports = connection;