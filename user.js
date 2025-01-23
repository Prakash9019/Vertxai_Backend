const mongoose= require("mongoose");
const {Schema}= mongoose;
const userSchema= new Schema({
    username:{
        type: String,
        // unique:true,
    },
    email:{
        type:String,
        required:true,
        unique: false,
        max:50,
    },
    password:{
        type:String,
        required:true,
        min:2,
    },
    dob:{
        type:Date,
        required:false,
    }
});

// const User=mongoose.model("Users",userSchema);
// User.createIndexes();
module.exports=mongoose.model("Users",userSchema);
