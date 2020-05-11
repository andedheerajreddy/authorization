//jshint esversion:6
require('dotenv').config()
const express=require("express");
const bodyparser =require("body-parser");
const mongoose=require("mongoose");
const ejs=require("ejs");
const encrypt=require("mongoose-encryption");
const app=express();
app.use(bodyparser.urlencoded({extended:true}));
app.set("view engine","ejs");
app.use(express.static("public"));
mongoose.connect("mongodb://localhost:27017/userDB",{useNewUrlParser:true});
const userSchema=new mongoose.Schema({
  email:String,
  password:String
});
userSchema.plugin(encrypt,{secret:process.env.SECRET,encryptedFields:["password"]});
const User= mongoose.model("User",userSchema);
app.route("/")
.get(function(req,res){
  res.render("home",{});
});
app.route("/login")
.get(function(req,res){
  res.render("login",{});
})
.post(function(req,res){
   User.findOne({email:req.body.username},function(err,found){
     if(err)
     res.send(err);
     else{
      if(found){
        if(found.password===req.body.password)
        res.render("secrets");
      }
     }
   });
});
app.route("/register")
.get(function(req,res){
  res.render("register",{});
})
.post(function(req,res){
       const newUser= new User({
            email:req.body.username,
            password:req.body.password
       });
       newUser.save(function(err){
         if(err)
         res.send(err);
         else
         res.render("secrets");
       });
});
app.listen(3000,function(){
  console.log("server started in port 3000");
});
