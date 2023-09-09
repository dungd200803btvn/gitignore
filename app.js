//jshint esversion:6
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const port = 3000;
const mongoose = require("mongoose");

const session = require('express-session');
const passport = require("passport");
const passportLocalMoongoose = require("passport-local-mongoose");
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const findOrCreate = require('mongoose-findorcreate');




app.use(express.static("public"));
app.set('view engine','ejs');
app.use(bodyParser.urlencoded({
    extended : true
}));

app.use(session({
    secret: "Our little secret.",
    resave: false,
    saveUninitialized: false
  }));
  app.use(passport.initialize());
  app.use(passport.session());

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


const userSchema = new mongoose.Schema({
    email: String,
    password: String,
    googleId: String
});
userSchema.plugin(passportLocalMoongoose);
userSchema.plugin(findOrCreate);






const User = new mongoose.model("User",userSchema);
passport.use(User.createStrategy());
const user1 = User.serializeUser();
const user2 = User.deserializeUser();
//passport.serializeUser(User.serializeUser());
//passport.deserializeUser(User.deserializeUser());

passport.serializeUser(function(user1, done) {
  done(null, user1);
});

passport.deserializeUser(function(user2, done) {
  done(null, user2);
});

//Google Strategy
passport.use(new GoogleStrategy({
  clientID: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  callbackURL: "http://localhost:3000/auth/google/secrets"
},
function(accessToken, refreshToken, profile, cb) {
  User.findOrCreate({ googleId: profile.id }, function (err, user) {
    console.log(profile);
    return cb(err, user);
  });
}
));

app.get("/",function(req,res){
res.render("home");
}
);

app.get('/auth/google',
  passport.authenticate('google', { scope: ["profile"] }));

  app.get('/auth/google/secrets', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/secrets');
  });  


app.get("/login",function(req,res){
    res.render("login");
    }
    );
    app.get("/register",function(req,res){
        res.render("register");
        }
        );  
        
// secrets route
app.get("/secrets",function(req,res){
    if(req.isAuthenticated()){
        res.render("secrets");
    }else{
        res.redirect("/login");
    }
});        
app.get("/logout", function(req, res) {
    req.logout(function(err) {
      if (err) {
        console.error(err);
      }
      res.redirect("/");
    });
  });

// register
app.post("/register", async (req, res) => {
    User.register({username: req.body.username},req.body.password,function(err,user){
        if(err){
            console.log(err);
            res.redirect("/register");
        }else{
            passport.authenticate("local")(req,res,function(){
                res.redirect("/secrets");
            })
        }
    });
  });
//login
  app.post("/login", async (req, res) => {
    const user = new User({
        username: req.body.username,
        password: req.body.password
    });
    req.login(user,function(err){
        if(err){
            console.log(err);
        }else{
            passport.authenticate("local")(req,res,function(){
                res.redirect("/secrets");
            })
        }
    })
  }); 

        
  app.listen(port, () => {
    console.log(`API is running at http://localhost:${port}`);
  });   