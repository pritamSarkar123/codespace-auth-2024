const mongoose = require("mongoose");

const {MONGODB_URL} = process.env

exports.connect = () =>{
    mongoose.connect(MONGODB_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    } )
    .then(
        console.log("DB connected successfully")
    )
    .catch((err) => {
        console.error(`db connection failed err: ${err}`);
        process.exit(1);
    });
}
