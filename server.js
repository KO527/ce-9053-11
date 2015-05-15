var express = require("express");
var mongoose = require("mongoose");
var bodyParser = require("body-parser");
var jwt = require("jwt-simple");
var SECRET = "foo";

var PersonSchema = new mongoose.Schema({
  name: { type: String, unique: true, required: true },
  active: { type: Boolean, default: true },
  color: { type: String, default: 'yellow' }
});

var Person = mongoose.model("Person", PersonSchema);

var UserSchema = new mongoose.Schema({
  username: String,
  password: String
});

var User = mongoose.model("User", UserSchema);

var ThingSchema = new mongoose.Schema({
  name: { type: String, unique: true, required: true },
  color: { type: String },
  description: { type: String }
});

var Thing = mongoose.model("Thing", ThingSchema);

mongoose.connect("mongodb://localhost/my_world");
mongoose.connection.once("open", function(){
  console.log("i am connected");
});


var app = express();

app.locals.pretty = true;

app.set("view engine", "jade");

app.use(express.static(__dirname + "/client"));
app.use(express.static(__dirname + "/prod"));
app.use(bodyParser.json());


var authorize = function(req, res, next){
  try{
    var decoded = jwt.decode(req.params.token, SECRET);
    User.findById(decoded._id, function(err, user){
      next();
    });
  }
  catch(ex){
    res.status(401).send({error: "You must be authorized for this action"});
  }
};

var paths = ["/", "/people/:id?", "/things", "/login"];


paths.forEach(function(path){
  app.get(path, function(req, res, next){
    res.render("index");
  });
});

//api
app.get("/api/session/:token", function(req, res){
  try{
    var decoded = jwt.decode(req.params.token, SECRET);
    User.findById(decoded._id, function(err, user){
      res.send(user);
    });
  }
  catch(ex){
    
  }
});

app.post("/api/sessions", function(req, res){
  if(!req.body.password)
    return res.status(500).send({error: "No password??"});
  User.findOne(req.body, function(err, user){
    if(user){
      var _user = {
        _id: user._id
      };
      return res.send(jwt.encode(_user, SECRET));
    }
    else
      return res.status(401).send({"error": "no user found"});
  });
});
app.get("/api/people", function(req, res){
  Person.find({}).sort("name").exec(function(err, people){
    res.send(people);
  });
});

app.get("/api/people/:id", function(req, res){
  Person.findById(req.params.id).exec(function(err, person){
    res.send(person);
  });
});

app.delete("/api/people/:id", authorize, function(req, res){
  Person.remove({_id: req.params.id}).exec(function(){
    res.send({deleted: true});
  });
});
app.post("/api/people/:token", authorize, function(req, res){
  Person.create(req.body, function(err, person){
    if(err){
      res.status(500).send(err);
    }
    else{
      res.send(person);
    }
  });
});

app.post("/api/people/:id/:token", authorize, function(req, res){
  Person.update({ _id: req.params.id } , { name: req.body.name, color: req.body.color }, function(err, result){
    if(err){
      res.status(500).send(err);
    }
    else{
      res.send(result);
    }
  });
});

app.get("/api/things/", function(req, res){
  Thing.find({}).sort("name").exec(function(err, things){
    res.send(things);
  });
});

app.get("/api/things/:id", function(req, res){
  Thing.findById(req.params.id).exec(function(err, thing){
    res.send(thing);
  });
});

app.delete("/api/things/:id/:token", authorize, function(req, res){
  Thing.remove({_id: req.params.id}).exec(function(){
    res.send({deleted: true});
  });
});

app.post("/api/things/:token", authorize, function(req, res){
  Thing.create(req.body, function(err, thing){
    if(err){
      res.status(500).send(err);
    }
    else{
      res.send(thing);
    }
  });
});

app.post("/api/things/:id/:token", authorize, function(req, res){
  Thing.update({ _id: req.params.id } , { name: req.body.name, color: req.body.color, description: req.body.description }, function(err, result){
    if(err){
      res.status(500).send(err);
    }
    else{
      res.send(result);
    }
  });
});

app.listen(process.env.PORT);
