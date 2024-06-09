const jwt  = require("jsonwebtoken");
const mongoose = require('mongoose');
const User = require("../model/user")

const auth = async (req, res, next) => {
    // grab token from cookie
    const {token} = req.cookies
    // if no token, stop there 
    if(!token){
        res.status(403).send("please login first");
    }

    // decode the token if not valid then stop
    try{
        const decode = jwt.verify(token, 'pritam'); // process.env.jwtsecret

        // query to DB for that user id
        const { id } = decode;
        const objectId = new mongoose.Types.ObjectId(id);
        const user = await User.findById(objectId);

        if(!user) {
            res.status(403).send("please login first");
        }
        req.user = user;
    }catch(error){
        console.log(String(error));
        res.status(401).send("Invalid token")
    }

    return next();
}

module.exports = auth;


