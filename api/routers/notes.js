const express=require('express');
const router=express.Router();
const fetchuser=require('../middlewares/authenticateToken.js');
const Note=require('../note.js');
const Card=require("../card.js");
const { body, validationResult } = require('express-validator');
const { findByIdAndUpdate } = require('../note.js');
const { MongoClient } = require('mongodb');



// Database and Collection names
// const dbName = 'your-database';
// const collectionName = 'your-collection';
// findOne for specific user data to retrieve 
// find will retrive all the data irrespective of the user
// findById is used to retrive the sepcific document of user using its unique id
// findByIdandUpdate is used to  find the specific doc and update it value with 2 params { $set: newNote }, { new: true } set data or add new data 
//findByIdandDelete is used to delete the document of user using its unique id
// TTL value in seconds (30 days)
const ttlSeconds = 30 * 24 * 60 * 60;

router.get('/fetchall', fetchuser,  async (req, res) => {
    try {
      const Uid=req.user.id;
      const notes = await Note.find({user:Uid});
      // console.log(Uid);
      // console.log(id);
      res.json(notes);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal Server Error");
    }
  });
  
  // 2: Add a new Note , Login required
router.post('/addnote', fetchuser, [
  body('title', 'Enter a valid title').isLength({ min: 3 }),
  body('description', 'Description must be atleast 5 characters').isLength({ min: 5 }),], async (req, res) => {
      try {
        // using destructing method of javascript for send the requested data to corresponding fields
        console.log(req.body);
          const { title, description,status,priority} = req.body;
           console.log(status);
          // If there are errors, return Bad request and the errors
          const errors = validationResult(req);
          if (!errors.isEmpty()) {
              return res.status(400).json({ errors: errors.array() });
          }
          //created a new note with "new" keyword
          //new note object  contain title...
          const note = new Note({
               title, description, status,priority ,user: req.user.id
          })
          //saving the notes 
          const savedNote = await note.save();
          console.log("hello world");
          console.log(note);
          // return the notes as the response
          res.json(savedNote);

      } catch (error) {
          console.error(error.message);
          res.status(500).send("Internal Server Error");
      }
  })

  //  3: Update . Login required
router.put('/updatenote/:id', fetchuser, async (req, res) => {
  //The PUT method is used to modify a single resource. The POST method is used to add a child resource
  // same PUT request multiple times will always produce the same result 

  const {title, description,status,priority } = req.body;
  try {
      // Create a newNote object
      console.log("bcakend....")
      console.log(req.body);
      const newNote = {};
     
      if (title) { newNote.title = title };
      if (description) { newNote.description = description };
      if (status) { newNote.status = status };
      if (priority) { newNote.priority = priority };
      // Find the note to be updated and update it
      //getting the notes by findById method...
      let note = await Note.findById(req.params.id);
      // console.log(note._id);
      if (!note) { return res.status(404).send("Not Found") }
      //matching the existing user id with the login id9
    //  console.log(note.Uid + "   " +Uid);
      if (note.user.toString() !== req.user.id) {     // checks whether the user login in is using his notes or other 
          return res.status(401).send("Not Allowed");
      }
      //find and update the data by findByIdandupdate
     // findByIdAndUpdate()
      note = await Note.findByIdAndUpdate(req.params.id, { $set: newNote }, { new: true })   //sending the new note in place of the old note
      res.json({ note });
  } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal Server Error");
  }
})

// ROUTE 4: Delete . Login required
router.delete('/deletenote/:id', fetchuser, async (req, res) => {
  try {
      // Find the note to be delete and delete it
      let note = await Note.findById(req.params.id);
      if (!note) { return res.status(404).send("Not Found") }

      // Allow deletion only if user owns this Note
      if (note.user.toString() !== req.user.id) {
          return res.status(401).send("Not Allowed");
      }

      note = await Note.findByIdAndDelete(req.params.id)
      res.json({ "Success": "Note has been deleted", note: note });
  } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal Server Error");
  }
})

//markers notes

router.post('/addmark', fetchuser, async (req, res) => {
      try {
        // using destructing method of javascript for send the requested data to corresponding fields
        // console.log(req.body);
          const { coordinate,title, description,typeofproblem,image } = req.body;
          // If there are errors, return Bad request and the errors
          const errors = validationResult(req);
          if (!errors.isEmpty()) {
              return res.status(400).json({ errors: errors.array() });
          }
          //created a new note with "new" keyword
          //new note object  contain title...
        //  await Card.createIndex({ createdAt: 1 }, { expireAfterSeconds: ttlSeconds });
         // const createdAt=new Date();
          const note = new Card({
            coordinate,title, description,typeofproblem,image, user: req.user.id
          })
          // console.log(note);
          //saving the notes 
          const savedNote = await note.save()
          // return the notes as the response
          res.json(savedNote);

      } catch (error) {
          console.error(error.message);
          res.status(500).send("Internal Server Error");
      }
  })

//fetch all marker data 
router.get('/fetchallmarkers', fetchuser,  async (req, res) => {
  try {
    // console.log(req.user);
    const notes = await Card.find({id : req.user.id});
    res.json(notes);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
});



  module.exports=router;