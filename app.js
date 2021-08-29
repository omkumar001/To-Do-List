const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _=require("lodash");

const date = require(__dirname + "/date.js");

const app = express();

//using EJS as a view engine
app.set("view engine", "ejs");

//Using the Body parser packager insatlled
app.use(bodyParser.urlencoded({ extended: true }));

//for loading all the CSS as well as the JS files while on server
app.use(express.static("public"));

// Connection URL
mongoose.connect("mongodb+srv://<UserName>:<Password>@cluster0.7anj2.mongodb.net/todolistDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

//Schema
const itemSchema = new mongoose.Schema({
  name: String,
});


const Item = mongoose.model("Item", itemSchema); //the model from schema


//inserting items into the database using docs.
const item1 = new Item({
  name: "Welcome to the To-Do-List",
});

const item2 = new Item({
  name: "Press + to add items to the list",
});

const item3 = new Item({
  name: "<-- Tick this checkbox to cancel out this list item",
});



const defaultItems = [item1, item2, item3];

const ListSchema={
  name: String,
  items:[itemSchema],

};

const List=mongoose.model("List",ListSchema);



app.get("/", function (req, res) {
  //res.sendFile(__dirname + "/index.html");

  Item.find({}, function (err, foundItems) {


    if (foundItems.length == 0) {

      Item.insertMany(defaultItems, function (err) {
        if (err) {
          console.log(err);
        } else {
          console.log("Inserted Successfully !!");
        }
      });
      res.redirect("/");
    }

     else {
      res.render("list", { listTitle: "Today", newAddedList: foundItems });
    }

  });
});


app.get("/:customList",function(req,res){

  const page=_.capitalize(req.params.customList);


  List.findOne({name:page},function(err,foundList){
     
    if(!err)
    {
    if(!foundList)
    {
      const list= new List({
        name:page,
        items:defaultItems,
        });
      
        list.save();
        res.redirect("/"+page);
    }
    else
    {
     res.render("list",{listTitle:foundList.name, newAddedList: foundList.items});
    }
    
  }
    

  });

  console.log(page);

});





app.post("/", function (req, res) {
  var item = req.body.newItem;
  var listName=req.body.list;

  const newItem = new Item({
    name: item ,
  });

   if(listName==="Today"){
    newItem.save();
    res.redirect("/");
   }
  else{
    List.findOne({name:listName},function(err,foundList){
      foundList.items.push(newItem);
      foundList.save();
      res.redirect("/"+listName);
    });
  }
   
  
  
});





// //Delete router
// app.get("/delete", function (req, res) {
//   res.render();
// });


app.post("/delete", function (req, res) {

  var deleteItemid = req.body.checkfield;
  const listName=req.body.listName;

  
  if(listName==="Today")
  {
    Item.findByIdAndRemove(deleteItemid,  function (err) {
      if (!err) 
       {
        console.log("Item ID : "+deleteItemid+" is deleted !!");
        res.redirect("/");
       }
    });
  }

  else{

    List.findOneAndUpdate({name:listName},{$pull:{items:{_id:deleteItemid}}},function(err){
         
      if(!err)
      res.redirect("/"+listName);

    });

  }


  

});






//About Router
app.get("/about", function (req, res) {
  res.render("about");
});


app.post("/about", function (req, res) {
  res.redirect("/about");
});





app.listen(process.env.PORT || 3000, function () {
  console.log("Server started at the port 3000.");
});

//Created the views folder for the view engine
