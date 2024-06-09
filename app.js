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
    return res.send("<h1>Welcome to my API</h1>");
})
app.post("/register", async (req,res)=>{
    try{
        // get data from body
        const {firstname,lastname,email,password} = req.body
        // all the data should exists
        if(!(firstname && lastname &&  email &&  password)) {
            return res.status(400).send("All fields are compulsory");
        }
        // if user already exists
        const existing_user = await User.findOne({ email })
        if (existing_user){
            return res.status(401).send("User already exists");
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
        const { JWT_SECRET } = process.env
        const token = jwt.sign(
            {
                id: user._id
            },
            JWT_SECRET, // process.env.jwtsecret
            {
                expiresIn: "2h"
            }

        );
        user.token = token;
        user.password = undefined; // it will not set the value in db, just will not send the password to client
        return res.status(201).json(user)
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
            return res.status(400).send("All fields are compulsory");
        }
        // find user in db
        const user = await User.findOne({ email })
        // if user is not present
        if (!user){
            return res.status(403).send("wrong credentials");
        }
        // match the password 
        const passwodMatched = await bcrypt.compare(password, user.password)
        if (!passwodMatched) {
            return res.status(403).send("wrong credentials")
        }
        // send token<and save the new token>
        const { JWT_SECRET } = process.env
        const token = jwt.sign(
            {
                id: user._id
            },
            JWT_SECRET, // process.env.jwtsecret
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
        return res.status(200).cookie("token",token,options).json({
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
    return res.send("Welcome to dashboard");
})


app.get('/logout',auth, async (req, res) => {
    try {
        // Clear the token cookie
        res.clearCookie('token');
        return res.status(200).json({
            message: "Logged out successfully",
            success: true
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "An error occurred during logout",
            success: false
        });
    }
});
module.exports = app;