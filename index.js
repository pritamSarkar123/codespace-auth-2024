const app = require("./app");


const {PORT} = process.env
app.listen(PORT, ()=>{
    console.log(`server is running at port: ${PORT}`);
});

app.get("/",(req,res)=>{
    res.send("<h1>Welcome to my API</h1>");
})
