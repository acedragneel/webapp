const express = require('express');
const bcrypt = require('bcrypt');
const mysql = require('mysql');
const dotenv = require('dotenv');
const connection = require('../db/connect.js');

dotenv.config();

const router = express.Router();

// all routes should start with / as this is give / users in the index.js
//GET

router.get("/user/:userId",async function(req,res) { 
    const iduser = req.params.userId;
    const error = "Invalid id"

    let idError = validateNumber(iduser);

    if(idError){

        const sqlGetUserData = `SELECT iduser,First_Name,Last_Name,username,account_created,account_updated FROM menagerie.user WHERE iduser = ?`;
        const getQuery = mysql.format(sqlGetUserData,[iduser]); 

        connection.query(getQuery, function(err,result){
            if(err) throw err;
            if(result.length == 0){
                res.status(400).send("The userid doesn't exists");
            }else{
                res.status(200);
                res.send(result);
                console.log("//GET"+ '\n' +  JSON.stringify(result) +  "is fetched")
            }
        });

    }else{
        res.status(400).send(error);
    }

});

//POST
router.post("/user", async function(req,res){
    const response = req.body;
    const firstName = req.body.firstName;
    const lastName = req.body.lastName;
    const email = req.body.username;
    const password = req.body.password;

    let responseErr = checkResponseForPost(response);

    let passwordErr = validatePassword(password); 
    let emailError = validateEmail(email);
    let firstNameErr = validateFirstAndLastName(firstName);
    let lastNameErr = validateFirstAndLastName(lastName);

    if(responseErr){

        if(firstNameErr && lastNameErr)
        {
            if(emailError && passwordErr ){
                let hashedPassword= await encryptPassword(password);
                    const sqlSearch = `SELECT * from menagerie.user WHERE username = ?`;
                    const searchQuery = mysql.format(sqlSearch,[email]); 
    
                    const sqlLoaded = `SELECT iduser,First_Name,Last_Name,username,account_created,account_updated from menagerie.user WHERE username = ?`;
                    const getLoaded = mysql.format(sqlLoaded,[email]); 
    
                    const sqlInsert = "INSERT INTO menagerie.user(First_Name,Last_Name,username,Password)VALUES(?,?,?,?)";
                    const insert_query = mysql.format(sqlInsert,[firstName,lastName,email,hashedPassword]);
    
                    connection.query(searchQuery, function(err,result){
                        if(err) throw err;
                        if(result.length != 0){
                            res.status(400).send("The account already exists")
                        }else{
                            connection.query(insert_query, function(err,result){
                                if(err) throw err;
                                res.status(201)
                                connection.query(getLoaded, function(err,result){
                                    res.send(result);
                                });
                                console.log("//POST"+ '\n' +  JSON.stringify(result) +  "is added")
                            });
                        }
                    });
        
            }else{
                res.status(400).send("Invalid email or password");
            }
        }else{
            res.status(400).send("Empty firstName or LastName");
        }
    }else{
        res.status(400).send("UnIntened Key is being sent ");
    }
    
});

//INSERT
router.put("/user/:userId", async function(req,res){

    const response = req.body;
    const iduser = req.params.userId;
    const firstName = req.body.firstName;
    const lastName = req.body.lastName;
    const email = req.body.username;
    const password = req.body.password;

    let idError = validateNumber(iduser);
    let responseErr = checkResponseForPost(response);
    let passwordErr = validatePassword(password); 
    let emailError = validateEmail(email);
    let firstNameErr = validateFirstAndLastName(firstName);
    let lastNameErr = validateFirstAndLastName(lastName);

    const error = "Invalid id"

    if(responseErr){

        if(idError){ 

            if(firstNameErr && lastNameErr)
            {
                    if(emailError && passwordErr ){
                        let hashedPassword= await encryptPassword(password);
                            const sqlSearch = `SELECT * from menagerie.user WHERE iduser = ?`;
                            const searchQuery = mysql.format(sqlSearch,[iduser]); 
    
                            const sqlLoaded = `SELECT iduser,First_Name,Last_Name,Email from menagerie.user WHERE username = ?`;
                            const getLoaded = mysql.format(sqlLoaded,[email]); 
    
                            const sqlUpdate = "UPDATE menagerie.user SET First_Name= ?,Last_Name=?,Password = ? WHERE iduser = ?";
                            const update_query = mysql.format(sqlUpdate,[firstName,lastName,hashedPassword,iduser]);
    
                            connection.query(searchQuery, function(err,result){
                                if(err) throw err;
                                if(result.length == 0){
                                    res.status(400).send("The account doesn't exists")
                                }else{  
                                    if(result[0].username == email){
                                        connection.query(update_query, function(err,result){
                                            if(err) throw err;
                                            res.status(200).send("The account is updated")
                                            console.log("//PUT"+ '\n' +  JSON.stringify(result) +  "is updated")
                                        });
                                    }else{
                                        res.status(400).send("The username is wrong")
                                    }
                                }
                            });
                
                    }else{
                        res.status(400).send("Invalid email or password");
                    }
    
                }else{
                    res.status(400).send("The firstName or LastName that needs to updated is Empty");
                }
    
        }else{
            res.status(403).send(error);
        }

    }else{
        res.status(400).send("UnIntened Key is being sent ");
    }
});

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

function validateFirstAndLastName(name){
    let regex = /^[a-zA-Z]+$/;
    if (regex.test(name) == false) {
    return false;
    } else {
    return true;
    }
}

async function encryptPassword(password){
    // Encryption of the string password
        const Salt = await bcrypt.genSalt(10);
        return bcrypt.hashSync(password, Salt);    
}

function validateNumber(number){

    if(isNaN(number)){
        return false;
    }else{
        return true;
    }

}

function checkResponseForPost(response){

    const knownKeys = ['firstName', 'lastName', 'username', 'password'];
    let isValid = false;    

    Object.keys(response).forEach(key => {
          if (!knownKeys.includes(key)){
            isValid = false;
          }else{
            isValid = true;
          }  
        });

        return isValid;

}

module.exports = router;