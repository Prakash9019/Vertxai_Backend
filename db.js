const exp=require('express');
const mongoose=require('mongoose');
mongoose.set('strictQuery',true);
// mongodb+srv://Prakash:<password>@cluster0.emqxvew.mongodb.net/?retryWrites=true&w=majority
const connectDB= ()=>{
    mongoose.connect("mongodb://127.0.0.1:27017/vertxai3"
    );
    console.log("connected");
}


// mongodb+srv://plsprakash2003:Surya_2003@cluster0.2yh1df7.mongodb.net/pro?retryWrites=true&w=majority&ssl=true
module.exports=connectDB;
//mongodb://localhost:27017