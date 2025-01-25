const exp=require('express');
const mongoose=require('mongoose');
mongoose.set('strictQuery',true);

// mongodb+srv://Prakash:<password>@cluster0.emqxvew.mongodb.net/?retryWrites=true&w=majority

const connectDB= ()=>{
    mongoose.connect('mongodb+srv://plsprakash2003:Surya_2003@cluster0.bpe9m.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'
  );
    console.log("connected");
}






// mongodb+srv://plsprakash2003:Surya_2003@cluster0.bpe9m.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0




// mongodb+srv://plsprakash2003:mtdDGUhzcjGH9QEh@cluster0.uygol.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
// mongodb+srv://plsprakash2003:Surya_2003@cluster0.2yh1df7.mongodb.net/pro?retryWrites=true&w=majority&ssl=true
// mongodb+srv://plsprakash2003:<db_password>@cluster0.uygol.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
module.exports=connectDB;
//mongodb://localhost:27017