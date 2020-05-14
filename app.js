//jshint esversion:6
require('dotenv').config()
const express=require("express");
const bodyparser =require("body-parser");
const mongoose=require("mongoose");
const ejs=require("ejs");
const encrypt=require("mongoose-encryption");
const app=express();
const passport=require("passport");
const passportlocal =require("passport-local");
const passportlocalmongoose= require("passport-local-mongoose");
const session =require("express-session");
app.use(bodyparser.urlencoded({extended:true}));
app.set("view engine","ejs");
app.use(express.static("public"));
app.use(session({
  secret:"this is our secret..",
  resave:false,
  saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());
mongoose.connect("mongodb://localhost:27017/userDB",{useNewUrlParser:true});
mongoose.set('useCreateIndex', true);
const userSchema=new mongoose.Schema({
  username  :String,
  password:String
});
userSchema.plugin(passportlocalmongoose);
// userSchema.plugin(encrypt,{secret:process.env.SECRET,encryptedFields:["password"]});
const User= mongoose.model("User",userSchema);
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
  app.route("/secrets")
  .get(function(req,res){
    if(req.isAuthenticated())
    res.render("secrets");
    else
    res.redirect("\login");
  });
app.route("/")
.get(function(req,res){
  res.render("home",{});
});
app.route("/login")
.get(function(req,res){
  res.render("login",{});
})
.post(function(req,res){
const user=new User({
  username: req.body.username,
  password :req.body.password
});
req.login(user,function(err){
  if(!err){
    passport.authenticate("local")(req,res,function(){
      res.redirect("/secrets");
    });
  }
});
});
app.route("/register")
.get(function(req,res){
  res.render("register",{});
})
.post(function(req,res){
User.register({username:req.body.username},req.body.password,function(err,user){
  if(err){console.log(err);res.redirect("/register");}
  else{
    passport.authenticate("local")(req,res,function(){
      res.redirect("/secrets");
    });
  }
});
});
app.get("/logout",function(req,res){
  req.logout();
  res.redirect("/");
});
app.listen(3000,function(){
  console.log("server started in port 3000");
});
