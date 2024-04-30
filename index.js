const express = require('express');
const session = require('express-session');
const cors = require('cors');
const model = require('./model');

function authorizeRequest(req, res, next) {
  if (req.session && req.session.userId) {
    model.User.findOne({ _id: req.session.userId }).then(function (user) {
    if (user) {
      req.user = user;
      next();
    } else {
      res.status(401).send("Unauthenticated");
    }
  });
  } else {
    res.status(401).send("Unauthenticated");
  }
}

const app = express();
const port = process.env.PORT || 8080;
app.use(express.urlencoded({ extended: false }));
app.use(express.static('public'));
app.use(session({
  secret:"asbjcpvou34098bl123123kmvdlsx0583l5jgmbbn9201jrkvmdd3u",
  saveUninitialized: true,
  resave: false,
  //cookie: {
  //  secure: true,
  //  sameSite: 'None'
  //}
}));

app.use(cors({
  credentials: true,
  origin: function (origin, callback) {
    callback(null, origin);
  }
}));

app.get('/recipes', authorizeRequest, function (req, res) {
	console.log("query params:", req.query);

	var findQuery = { user: req.user._id };
	var findOrder = {};

	if (req.query.filterName) {
		findQuery.name = { $regex: req.query.filterName };
	}

	if (req.query.filterTime) {
		findQuery.time = { $lte: req.query.filterTime }; 
	}

	if (req.query.filterType) {
		findQuery.type = { $regex: req.query.filterType };
	}
	if (req.query.filterIngredients) {
		findQuery.ingredients = { $regex: req.query.filterIngredients };
	}
	//Person.find({ "name": { "$regex": "Alex", "$options": "i" } },
	if (req.query.orderBy) {
	  if (req.query.orderBy == 'name1') {
	    findOrder.name = 1;
	    console.log(findOrder);
	  }
	  if (req.query.orderBy == 'name-1') {
	    findOrder.name = -1;
	  }
	  if (req.query.orderBy == 'time1') {
	    findOrder.time = 1;
	  }
	  if (req.query.orderBy == 'time-1') {
            findOrder.time = -1;
	  }
	  if (req.query.orderBy == 'type1') {
	    findOrder.type = 1;
	  }
	  if (req.query.orderBy == 'type-1') {
            findOrder.type = -1;
	  }
	}

	model.Recipe.find(findQuery).sort(findOrder).then(recipe => {
	  res.json(recipe);
	});
});

app.get('/recipes/:recipeID', authorizeRequest, function (req, res) {
  model.Recipe.findOne({ _id: req.params.recipeID, user: req.user._id }).then(recipe => {
    if(recipe) {
      res.json(recipe);
    } else {
      res.status(404).send("Recipe not found");
    }
  }).catch(() => {
    res.status(400).send("Recipe not found");
  });
});

app.post('/recipes', authorizeRequest, function (req, res) {
	const newRecipe = new model.Recipe({
	  name: req.body.name,
	  type: req.body.type,
	  time: req.body.time,
	  ingredients: req.body.ingredients,
	  instructions: req.body.instructions,
	  user: req.user._id
	});
	newRecipe.save().then(() => {
	  console.log('recipe saved to db');
	  res.status(201).send("Recipe added.");
	}).catch((error) => {
	  console.log('failed to save recipe to db');
	  if (error.errors) {
	    let errorMessages = {};
	    for (let e in error.errors) {
		errorMessages[e] = error.errors[e].message;
	    }
	    res.status(422).json(errorMessages);
	  } else {
	    res.status(500).send("server failed to create recipe.");
	  }
	});
});

app.put('/recipes/:recipeID', authorizeRequest, function(req, res) {
        model.Recipe.findOneAndUpdate(req.params.recipeID, req.user._id, {
	      name: req.body.name,
              type: req.body.type,
              time: req.body.time,
              ingredients: req.body.ingredients,
              instructions: req.body.instructions
        }).then(() => {
          console.log('recipe saved to db');
          res.status(200).send("Recipe changed.");
        }).catch((error) => {
          console.log('failed to save recipe to db');
          if (error.errors) {
            let errorMessages = {};
            for (let e in error.errors) {
                errorMessages[e] = error.errors[e].message;
            }
            res.status(422).json(errorMessages);
          } else {
            res.status(500).send("server failed to edit recipe.");
          }
        });
});

app.delete('/recipes/:recipeID', authorizeRequest, function(req, res) {
  model.Recipe.findOne({ _id: req.params.recipeID, user: req.user._id }).then(recipe => {
    if (recipe) {
      model.Recipe.deleteOne({ _id: req.params.recipeID }).then(recipe => {
        res.status(200).send("recipe deleted");
      });
    } else {
	res.status(404).send("Not found");
    }
  });
});

app.post('/users', function (req, res) {
        const newUser = new model.User({
          firstname: req.body.first,
          lastname: req.body.last,
          email: req.body.email
        });
        newUser.setEncryptedPassword(req.body.password).then(function () { 
	  newUser.save().then(() => {
            console.log('user saved to db');
            res.status(201).send("Created user.");
          }).catch((error) => {
            console.log('failed to create user');
            if (error.errors) {
              let errorMessages = {};
              for (let e in error.errors) {
                errorMessages[e] = error.errors[e].message;
              }
              res.status(422).json(errorMessages);
            } else {
              res.status(500).send("server failed to create user.");
            }
          });
        });

});

//app.get('/users/:userID', authorizeRequest, function (req, res) {
//  model.User.findOne({ _id: req.params.userID }).then(user => {
//    if(user) {
//      res.json(user);
//    } else {
//      res.status(404).send("User not found");
//    }
//  }).catch(() => {
//    res.status(400).send("User not found");
//  });
//});
//
//app.delete('/users/:userID', authorizeRequest, function(req, res) {
//  model.User.findOne({ _id: req.params.userID }).then(user => {
//    if (user) {
//      model.User.deleteOne({ _id: req.params.userID }).then(user => {
//        res.status(200).send("user deleted");
//      });
//    } else {
//        res.status(404).send("Not found");
//    }
//  });
//});

app.post('/session', function (req,res) {
  model.User.findOne({ email: req.body.email }).then(function (user) {
    if (user) {
      user.verifyEncryptedPassword(req.body.password).then(function (result) {
	if (result) {
	  req.session.userId = user._id;
	  res.status(201).send("Authenticated");
	} else {
	  res.status(401).send("Unauthenticated");
	}
      });
    } else {
      res.status(401).send("Unauthenticated");
    }
  });
});

//app.get('/session', authorizeRequest, function (req,res) {
//  console.log("the current sessions data:", req.session);
//  res.json(req.user);
//});

app.delete('/session', function (req, res) {
  req.session.userId = undefined;
  res.status(204).send("Logged out");
});

app.listen(port, function () {
	console.log('Server running on port ${port}...');
});


