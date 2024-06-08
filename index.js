const app = require("./app");


const {PORT} = process.env
app.listen(PORT, ()=>{
    console.log(`server is running at port: ${PORT}`);
});

app.get("/",(req,res)=>{
    res.send("<h1>Welcome to my API</h1>");
})
app.post("/register", async (req,res)=>{
    try{
        // get data from body
        // all the data should exists
        // if user already exists
        // encrypt the password 
        // save the user in db
        // generate the token for user and send it
    } catch (error) {
        console.log(error);
    }
})
