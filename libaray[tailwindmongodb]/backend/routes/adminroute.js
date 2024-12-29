import { json, Router } from "express";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { authenticate } from "../middleware/auth.js";
import mongoose, { connect } from "mongoose";
import dotenv from "dotenv";


dotenv.config();
const admin=Router();
const secretkey = process.env.Secretkey;
const userSchema = new mongoose.Schema(
    {emailid:String,
    username:{type:String,unique:true},
    password:String,
    role:String})
mongoose.connect('mongodb://localhost:27017/LIBRARY')
const  User = mongoose.model('Userdetails',userSchema);

const bookSchema= new mongoose.Schema({
    authorname:String,
    bookname:{type:String,unique:true},
    description:String,
    price:String,    
  })
  //create model
  const  Books = mongoose.model('Bookdetails',bookSchema);

admin.post('/signup',async(req,res)=>{
    try{
    // console.log("hi");
    const data =req.body;
  
    const {username,emailid,password,role}=data;
    console.log("signup details");
    
    const newp = await bcrypt.hash(password,10)
    const existingUser= await User.findOne({username:username})
    console.log(existingUser)
    if(existingUser){
        res.status(400).json({message:"username already saved"}) 
    }
    else{

      const newUser= new User({
        emailid:emailid,
        username:username,
        password:newp,
        role:role
      })
       
       await newUser.save(); 
       console.log("signup successfully")
        res.status(201).json({message:"data saved"})
    }}
    catch(error){
        res.status(500).json(error);
    }
})  

// login part
admin.post('/login',async(req,res)=>{

    const{username,password}=req.body;
    // console.log(username);
    console.log("login details");
    const result= await User.findOne({username:username})
    // console.log(result);
    if(!result){
        res.status(404).json("user not found")
    }
    else{
      console.log(password)
      console.log(result.password)
        const isvalid =await bcrypt.compare(password,result.password)
        console.log(isvalid);
        if(isvalid){
        const token = await jwt.sign({username:username,userrole:result.role},secretkey,{expiresIn:'1h'})
        res.cookie('bookdet',token,{httpOnly:true});
        res.status(200).json({token});
        console.log("login successfully")
        }  
    }
    })

// add book
admin.post('/addbook',authenticate,async(req,res)=>{
    // try{
      const data = req.body;
     const {bookname,authorname,description,price}= data;
      const role =req.userrole;
      // const admin= "admin";
              if(role!== "admin"){
  
              res.send("you have no permission")
              }
              else{
                const bookcheck= await Books.findOne({bookname:bookname})
                  if(bookcheck){
                      res.status(400).json({message:"book already added"})
                  }
                  else{
                    const newBook= new Books({
                        bookname:bookname,
                        authorname:authorname,
                        description:description,
                        price:price
                      })
                       
                       await newBook.save(); 
                       console.log("book added successfully")
                        res.status(201).json({message:"book added  successfully"})
                   
                }
              }

  })

  //viewbook on click  of button
  admin.get('/viewbook', async(req,res)=>{
    try{
        console.log(addbook.size);
  
        if(addbook.size!=0){
           
            
        res.send(Array.from(addbook.entries()))
    }
  else{
    res.status(404).json({message:'Not Found'});
  }}
    catch{
        res.status(404).json({message:"Internal error"})
    }
  })

  //view certificate 
admin.get('/viewbook',async(req,res)=>{
    
    const data = req.query;
    const {bookname,authorname,description,price}= data;
    if(addbook.has(bookname))
    {
      console.log("view book ")
      console.log( "details",find)
     
      console.log(addbook.get(bookname));
      res.status(201).json(bookname)
      console.log("book added ");
      // res.json(find);

      
    }else{
      res.status(400).json("book is not found")
      console.log("book is not found")
    }
})
admin.get('/viewallbook', async(req,res)=>{

    try {
      // Fetch all courses from MongoDB
      const allbook = await Books.find({});
      
      if (allbook.length > 0) {
          console.log("All book  found:");
          console.log(allbook);
          res.status(200).json(allbook);  // Send all course data as JSON
      } else {
          console.log("No book found.");
          res.status(404).json({ message: 'No book found' });
      }
    } catch (error) {
      console.error("Error fetching all Book:", error);
      res.status(500).json({ message: "Internal server error" });
    }
    })
//view add course depending on the role means user or admin
admin.get('/viewuser',authenticate,(req,res)=>{
    try{
    const user=req.userrole;
    res.json({user});}
    catch{
        res.status(404).json({message:'user not authorized'});
    }
  })
  admin.post('/logout',(req,res)=>{
    res.clearCookie('bookdet');
    res.status(200).json('logout  successfully');
    console.log("logout  successfully");
   })


export {admin};
