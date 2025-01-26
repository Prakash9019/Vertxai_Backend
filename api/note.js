const mongoose= require("mongoose");
const {Schema}= mongoose;
var moment = require('moment')

const NotesSchema = new Schema({
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'             // works as foriegn key for the user.js file
    },
    title:{
        type: String,
        required: true
    },
    description:{
        type: String,
        required: true, 
    },
    date:{
        type: Date,
        default: moment(new Date()).utc().format('DD/MM/YY')//new Date().format('DD/MM/YYYY'),
    },
    status:{
        type: String,
        default:"Incomplete",
    },
    priority:{
        type: String,
        default:"P0",
    },
  });

  module.exports = mongoose.model('notes', NotesSchema);