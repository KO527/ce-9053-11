var express = require("express");
var mongoose = require("mongoose");
var bodyParser = require("body-parser");

var PersonSchema = new mongoose.Schema({
  name: { type: String, unique: true, required: true }  
});

var Person = mongoose.model("Person", PersonSchema);

mongoose.connect("mongodb://localhost/my_world");
mongoose.connection.once("open", function(){
  console.log("i am connected");
});


var app = express();

app.locals.pretty = true;

app.set("view engine", "jade");

app.use(express.static(__dirname + "/client"));

app.use(bodyParser.json());

app.use(function(req, res, next){
  req.foo = Math.random().toString();
  next();
});

var paths = ["/", "/people", "/things"];

paths.forEach(function(path){
  app.get(path, function(req, res, next){
    res.render("index");
  });
});

//api
app.get("/api/people", function(req, res){
  Person.find({}).sort("name").exec(function(err, people){
    res.send(people);
  }); 
});

app.delete("/api/people/:id", function(req, res){
  Person.remove({_id: req.params.id}).exec(function(){
    res.send({deleted: true});
  });
})
app.post("/api/people", function(req, res){
  Person.create(req.body, function(err, person){
    if(err){
      res.status(500).send(err); 
    }
    else{
      res.send(person); 
    }
  });
});


app.listen(process.env.PORT);