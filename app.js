//jshint esversion:6
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const port = 3000;
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");
app.use(express.static("public"));
app.set('view engine','ejs');
app.use(bodyParser.urlencoded({
    extended : true
}));

const url = "mongodb+srv://admin:admin123@cluster0.aq21kv9.mongodb.net/userDB";
const mongooseOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true
};

async function connect() {
  try {
    await mongoose.connect(url, mongooseOptions);
    console.log("Connect Mongodb success");
  } catch (err) {
    console.error(err);
  }
}
connect();
console.log(process.env.API_KEY);
const userSchema = new mongoose.Schema({
    email: String,
    password: String
});
const secret = "Thisisourlittlesecret";
userSchema.plugin(encrypt, { secret: process.env.SECRET,encryptedFields: ["password"] });





const User = new mongoose.model("User",userSchema);

app.get("/",function(req,res){
res.render("home");
}
);
app.get("/login",function(req,res){
    res.render("login");
    }
    );
    app.get("/register",function(req,res){
        res.render("register");
        }
        );        
// post 
app.post("/register", async (req, res) => {
    try {
      const newUser = new User({
        email: req.body.username,
        password: req.body.password,
      });
      await newUser.save();
      res.render("secrets");
    } catch (err) {
      console.error(err);
      res.status(500).send("Đã xảy ra lỗi trong quá trình đăng ký");
    }
  });
  app.post("/login", async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
  
    try {
      const foundUser = await User.findOne({ email: username });
  
      if (foundUser && foundUser.password === password) {
        res.render("secrets");
      } else {
        res.send("Tên người dùng hoặc mật khẩu không đúng");
      }
    } catch (err) {
      console.error(err);
      res.status(500).send("Đã xảy ra lỗi trong quá trình đăng nhập");
    }
  }); 

        app.listen(port, () => {
            console.log(`API is running at http://localhost:${port}`);
          });     