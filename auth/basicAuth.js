const express = require('express');
const bcrypt = require('bcrypt');
const validate = require('../routes/users.js')
const mysql = require('mysql');
const connection = require('../db/connect.js');

const app = express();

// Basic HTTP authentication middleware
const auth = app.use((req, res, next) => {
    if (req.method === 'PUT' || req.method === 'GET') {

        if(!req.get('Authorization')){
            var err = new Error('Not Authenticated!')
            // Set status code to '401 Unauthorized' and 'WWW-Authenticate' header to 'Basic'
            res.status(401).set('WWW-Authenticate', 'Basic')
            res.send("Please give Basic Auth with username and password")
            next(err)
        }
        // If 'Authorization' header present
        else{
            // Decode the 'Authorization' header Base64 value
            var creds = Buffer.from(req.get('Authorization').split(' ')[1], 'base64')
            // <Buffer 75 73 65 72 6e 61 6d 65 3a 70 61 73 73 77 6f 72 64>
            .toString()
            // username:password
            .split(':')
            // ['username', 'password']

            var username = creds[0];
            var password = creds[1];

            var url = req.url.split('/');

            let userid = url[url.length-1];

            let PasswordErr = validatePassword(password);
            let UsernameErr = validateEmail(username);

            if(UsernameErr && PasswordErr) {

                    const sqlGetUserData = `SELECT iduser,username,password  FROM menagerie.user WHERE username = ?`;
                    const getQuery = mysql.format(sqlGetUserData,[username]); 

                    connection.query(getQuery, function(err,result){
                        if(err) throw err;
                        if(result.length == 0){
                            var err = new Error('Not Authenticated!')
                            // Set status code to '401 Unauthorized' and 'WWW-Authenticate' header to 'Basic'
                            res.status(401).set('WWW-Authenticate', 'Basic')
                            res.send("The username doesn't exists")
                            next(err)
                        }else{
                            if(userid == result[0].iduser){
                                if(username == result[0].username){
                                    const hashedPassword = result[0].password;
                                    bcrypt.compare(password, hashedPassword, function (err, result) {
                                        if (result === true) {
                                            next()
                                            console.log("Authenticated")
                                        } else {
                                            var err = new Error('Not Authenticated!')
                                            // Set status code to '401 Unauthorized' and 'WWW-Authenticate' header to 'Basic'
                                            res.status(401).set('WWW-Authenticate', 'Basic')
                                            res.send("The password is wrong in Authorization")
                                            next(err)
                                        }
                                    });
                                }else{
                                    var err = new Error('Not Authenticated!')
                                    // Set status code to '401 Unauthorized' and 'WWW-Authenticate' header to 'Basic'
                                    res.status(401).set('WWW-Authenticate', 'Basic')
                                    res.send("The username is wrong in Authorization")
                                    next(err)
                                }
                            } else{
                                var err = new Error('Not Authenticated!')
                                // Set status code to '401 Unauthorized' and 'WWW-Authenticate' header to 'Basic'
                                res.status(403)
                                res.send("The userid is wrong in the parameter")
                                next(err)
                            }                          
                        }
                    });
            }else{
                res.status(401).send("Invalid email or password in Authorization");
            }
        }
    }else {
        next();
    }
})

function validatePassword(password) {
	let passwordValue = password;
	var password_regex1=/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;

	if(password_regex1.test(passwordValue)==false){
		return false;
	}else{
		return true;
	}

}

function validateEmail(email){
    let regex = /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
	if (regex.test(email) == false) {
	return false;
	} else {
	return true;
	}
}

module.exports = auth;