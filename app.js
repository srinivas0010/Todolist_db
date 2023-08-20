//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect('mongodb://127.0.0.1:27017/todolistdb',{useNewUrlparser:true,useUnifiedTopology:true});

const itemsSchema={
  name: String
};

const Item=mongoose.model("Item",itemsSchema);

const item1=new Item({
  name:"welcome"
});
const item2=new Item({
  name:"enter symbol + to add a item"
});
const item3=new Item({
  name:"click checkbox to delete a item"
});

const array=[item1,item2,item3];

const listschema={
  name:String,
  items:[itemsSchema]
}

const List=mongoose.model("List",listschema);

app.get("/", function(req, res) {
  
Item.find({}).then(function(FoundItems){
  if (FoundItems.length===0) {
    Item.insertMany(array);
    res.redirect("/");
  }else{
    res.render("list", {listTitle: "Today", newListItems:FoundItems});}
  })
   .catch(function(err){
    console.log(err);
  })
});

app.post("/", function(req, res){

  const newitem1 = req.body.newItem;
  const custom = req.body.list;
  const itemnew=new Item({
    name: newitem1
  });
  if(custom==="Today"){
    itemnew.save();
    res.redirect("/");
  }else
  {
    List.findOne({name:custom}).exec().then(function(listitems){
      listitems.items.push(itemnew);
      listitems.save();
    }).catch(function(err){
      console.log(err);
    });
    res.redirect("/"+custom);
  }
   
  
});

app.post("/check",function(req,res){
  const temp = req.body.checkeditem;
  const temp1=req.body.hide;
  if(temp1==="Today"){
    Item.findByIdAndRemove(temp).exec();
    res.redirect("/");
  }else
  {
    List.findOneAndUpdate({name:temp1},{$pull:{items:{_id:temp}}}).exec().then(function(foundlist){
      
        res.redirect("/"+temp1);
  
    }).catch(function(err){
      console.log(err);
    });
  };
  
});

app.get("/:another",function(req,res){
  const customer= _.capitalize(req.params.another);

  List.findOne({name:customer}).exec().then(function(foundlist){
    if (!foundlist) {
      const list= new List({
        name:customer,
        items:array
      });
      list.save();
      res.redirect("/"+customer);
    }
    else{
      res.render("list",{listTitle: foundlist.name, newListItems:foundlist.items})
    }
  }).catch(function(err){
    console.log(err);
  })
  
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
