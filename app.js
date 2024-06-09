require("dotenv").config();
require("./database/database").connect()
const User = require("./model/user")
const express = require('express');
const bcrypt = require("bcryptjs");
const jwt  = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const auth = require("./middleware/auth");

const app = express();
app.use(express.json());
app.use(cookieParser());

app.get("/",(req,res)=>{
    res.send("<h1>Welcome to my API</h1>");
})
app.post("/register", async (req,res)=>{
    try{
        // get data from body
        const {firstname,lastname,email,password} = req.body
        // all the data should exists
        if(!(firstname && lastname &&  email &&  password)) {
            res.status(400).send("All fields are compulsory");
        }
        // if user already exists
        const existing_user = await User.findOne({ email })
        if (existing_user){
            res.status(401).send("User already exists");
        }
        // encrypt the password 
        const myEncryptedPassword = await bcrypt.hash(password, 10);
        // save the user in db
        const user = await User.create({
            firstname,
            lastname,
            email,
            password: myEncryptedPassword
        });
        // generate the token for user and send it
        const token = jwt.sign(
            {
                id: user._id
            },
            'pritam', // process.env.jwtsecret
            {
                expiresIn: "2h"
            }

        );
        user.token = token;
        user.password = undefined; // it will not set the value in db, just will not send the password to client
        res.status(201).json(user)
    } catch (error) {
        console.log(error);
    }
})

app.post("/login",async (req, res)=>{
    try{
        // get all data from frontend
        const {email,password} = req.body 
        // validation
        if(!(email &&  password)) {
            res.status(400).send("All fields are compulsory");
        }
        // find user in db
        const user = await User.findOne({ email })
        // if user is not present
        if (!user){
            res.status(403).send("wrong credentials");
        }
        // match the password 
        const passwodMatched = await bcrypt.compare(password, user.password)
        if (!passwodMatched) {
            res.status(403).send("wrong credentials")
        }
        // send token<and save the new token>
        const token = jwt.sign(
            {
                id: user._id
            },
            'pritam', // process.env.jwtsecret
            {
                expiresIn: "2h"
            }

        );
        user.token = token;
        user.password = undefined;
        // need to send the cookie 
        const options = {
            expires: new Date(Date.now() + 3*24*60*60*1000),
            httpOnly: true
        };
        res.status(200).cookie("token",token,options).json({
            success: true,
            token, 
            user
        });

    }catch(error){
        console.log(error);
    }
})


app.get("/dashboard",auth,(req, res)=>{
    console.log(req.user);
    res.send("Welcome to dashboard");
})

module.exports = app;