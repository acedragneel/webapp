const mysql = require('mysql');
const dotenv = require('dotenv');

dotenv.config();

let connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'password',
  database: 'menagerie'
});

connection.connect(function(err) {
    if (err) {
      return console.error('error: ' + err.message);
    }
  
    console.log('Connected to the MySQL server.');
  });

// connection.end(function(err) {
// if (err) {
//     return console.log('error:' + err.message);
// }
// console.log('Close the database connection.');
// });

// connection.destroy();

module.exports = connection;