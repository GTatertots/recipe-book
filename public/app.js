const SERVER_URL = ""

Vue.createApp({

	data: function () {
	    return {
		recipeName: "",
		recipeType: "",
		recipeTime: "",
		recipeIngredients: "",
		recipeInstructions: "",
		recipes: [],
		userFirst: "",
		userLast: "",
		userEmail: "",
		userPassword: "",
		userPassword2: "",
		//sessionData: "",
		fullRecipe: "",
		recipeErrorMessages: {},
		userErrorMessages: {},
		displayLogin: false,
		displayRegister: false,
	    	displayRecipes: true,
		displayAdd: false,
		displayUpdate: false,
		displayFullRecipe: false,
		orderByField: "",
		filterName: "",
		filterType: "",
		filterTime: "",
		filterIngredients: "",
		filterPresent: false,
	    	confirmDelete: false
	        };
	},


	methods: {
	    applyFilters: function () {
	      this.getRecipesFromServer();
	      if(this.filterName || this.filterType || this.filterTime || this.filterIngredients || this.orderByField) {
		this.filterPresent = true;
	      } else {
		this.filterPresent = false;
	      }
	    },
	    removeFilters: function () {
	            this.filterName = "";
	      	    this.filterType = "";
		    this.filterTime = "";
		    this.filterIngredients = "";
		    this.orderByField = "";
		    this.filterPresent = false;
		    this.getRecipesFromServer();
	    },
	    validateRecipe: function () {
		this.recipeErrorMessages = {};

		if (this.recipeName == "") {
		  this.recipeErrorMessages.recipeName = "Please enter the recipe name.";
		  console.log(this.recipeErrorMessages.recipeName)
		} 
		if (this.recipeType == "") {
		  this.recipeErrorMessages.recipeType = "Please enter the recipe type.";
		  console.log(this.recipeErrorMessages.recipeType)
		} 
		if (this.recipeTime == "") {
		  this.recipeErrorMessages.recipeTime = "Please enter the recipe cook time.";
		} else if (this.recipeTime <= 0) {
		  this.recipeErrorMessages.recipeTime = "Please enter a positive time in minutes.";
		}
		if (this.recipeIngredients == "") {
		  this.recipeErrorMessages.recipeIngredients = "Please enter at least 1 ingredient.";
		}
		if (this.recipeInstructions == "") {
		  this.recipeErrorMessages.recipeInstructions = "Please enter at least 1 instruction.";
		}
	        console.log(Object.keys(this.recipeErrorMessages).length);	
		return (Object.keys(this.recipeErrorMessages).length == 0);
	    },
	    validateUser: function () {
		this.userErrorMessages = {};
		if (this.userEmail == "") {
                  this.userErrorMessages.userEmail = "Please enter an email address";
                  console.log(this.userErrorMessages.userEmail);
		}
		if (this.userPassword.length < 6) {
                  this.userErrorMessages.userPassword = "Please enter a password with atleast 6 characters";
                  console.log(this.userErrorMessages.userPassword);
		}
		if(this.displayRegister) {
                  if (this.userFirst == "") {
                    this.userErrorMessages.userFirst = "Please enter a first name.";
                    console.log(this.userErrorMessages.userFirst);
                  }
                  if (this.userLast == "") {
                    this.userErrorMessages.userLast = "Please enter a last name.";
                    console.log(this.userErrorMessages.userLast);
                  }
		  if (this.userPassword != this.userPassword2) {
		    this.userErrorMessages.userPassword = "Passwords do not match.";
		  }
		}
		console.log(Object.keys(this.userErrorMessages).length);
                return (Object.keys(this.userErrorMessages).length == 0);
	    },
	    addRecipeButton: function () {
		if (!(this.validateRecipe())) {
		  console.log("validate did not pass")
		  return;
		}
		console.log("validate passed")    
		var data = "name=" + encodeURIComponent(this.recipeName);
		data += "&type=" + encodeURIComponent(this.recipeType);
		data += "&time=" + encodeURIComponent(this.recipeTime);
		this.recipeIngredients.trim();
		try {
		  var ingredients = this.recipeIngredients.split('\n');
		  for(i in ingredients) {
		    data += "&ingredients=" + encodeURIComponent(ingredients[i]);
		  }
		} catch {
		  data += "&ingredients=" + encodeURIComponent(this.recipeIngredients);
		}
		this.recipeIngredients.trim();
		try {    
		  var instructions = this.recipeInstructions.split('\n');    
		  for(i in instructions) {
		    data += "&instructions=" + encodeURIComponent(instructions[i]);
		  }
		} catch { 
		  data += "&instructions=" + encodeURIComponent(this.recipeInstructions);
		}
		fetch(SERVER_URL + "/recipes", {
		  method: "POST",
		  body: data,
		  credentials: 'include',
		  headers: {
	 	    "Content-Type": "application/x-www-form-urlencoded"
		  }
		}).then((response) => {
		  if (response.status == 201) {
		    this.getRecipesFromServer();
	 	    console.log("Recipe added:", this.recipeName);
		    this.recipeName = "";
		    this.recipeType = "";
		    this.recipeTime = "";
		    this.recipeIngredients = "";
		    this.recipeInstructions = "";
		  } else {
		    console.error("Failed to create recipe on server");
		  }
		});
		this.displayAdd = false;
		this.displayRecipes = true;
	    },
	    registerButton: function () {
                if (!(this.validateUser())) {
                  console.log("validate did not pass")
                  return;
                }
                console.log("validate passed")
                var data = "first=" + encodeURIComponent(this.userFirst);
                data += "&last=" + encodeURIComponent(this.userLast);
                data += "&email=" + encodeURIComponent(this.userEmail);
		data += "&password=" + encodeURIComponent(this.userPassword);
		fetch(SERVER_URL + "/users", {
                  method: "POST",
                  body: data,
                  credentials: 'include',
                  headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                  }
                }).then((response) => {
                  if (response.status == 201) {
                    console.log("User added:", this.userEmail);
                    this.userFirst = "";
                    this.userLast = "";
                    this.userEmail = "";
                    this.userPassword = "";
		    this.userPassword2 = "";
		    this.displayRegister = false;
                    this.displayLogin = true;
                  } else {
		    this.userErrorMessages.authentication = "Error creating account. Please try again later";
                    console.error("Failed to create user on server");
                  }
		});
	    },
	    loginButton: function () {
                if (!(this.validateUser())) {
                  console.log("validate did not pass")
                  return;
                }
                console.log("validate passed")
                var data = "email=" + encodeURIComponent(this.userEmail);
                data += "&password=" + encodeURIComponent(this.userPassword);
                fetch(SERVER_URL + "/session", {
                  method: "POST",
                  body: data,
                  credentials: 'include',
                  headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                  }
                }).then((response) => {
                  if (response.status == 201) {
		    this.getRecipesFromServer();
                    console.log("User signed in:", this.userEmail);
                    this.userFirst = "";
                    this.userLast = "";
                    this.userEmail = "";
                    this.userPassword = "";
		    this.userPassword2 = "";
		    this.displayLogin = false;
                    this.getRecipesFromServer();
                    this.displayRecipes = true;
                  } else {
                    console.error("Failed to log in");
		    this.userErrorMessages.authentication = "Failure to log in: Incorrect email or password.";
                  }
                });
	    },
	    editButton: function (recipe) {
	      this.displayUpdate = true;
	      this.displayFullRecipe = false;
	      this.recipeName = recipe.name;
	      this.recipeType = recipe.type;
	      this.recipeTime = recipe.time;
	      var ingredients = "";
	      for(i in recipe.ingredients) {
		var ingredient = recipe.ingredients[i];
		console.log(ingredient);
		if(i != (recipe.ingredients.length - 1)) {
 		  ingredients += ingredient + '\n';
		} else {
		  ingredients += ingredient;
		}
	      }
	      this.recipeIngredients = ingredients;
	      var instructions = "";    
	      for(i in recipe.instructions) {
		var instruction = recipe.instructions[i];
		console.log(instruction);
		if(i != (recipe.instructions.length -1)) {
		  instructions += instruction + '\n';
		} else {
		  instructions += instruction;
		}
	      }
	      this.recipeInstructions = instructions;
	    },
	    addRecipeToggle: function () {
		this.displayRecipes = false;
		this.displayAdd = true;
	    },
	    goBackToFull: function () {
		this.displayFullRecipe = true;
		this.displayUpdate = false;
	    },
	    goToRegister: function () {
		this.displayRegister = true;
		this.displayLogin = false;
		this.userErrorMessages = {};
		this.userEmail = "";
		this.userPassword = "";
	    },
	    goBackToLogin: function () {
		this.displayRegister = false;
		this.displayLogin = true;
		this.userFirst = "";
		this.userLast = "";
		this.userEmail = "";
		this.userPassword = "";
		this.userPassword2 = "";
		this.userErrorMessages = {};
	    },
	    goBackButton: function () {
		this.displayAdd = false;
		this.displayUpdate = false;
		this.displayFullRecipe = false;
		this.displayRecipes = true;
		this.recipeName = "";
		this.recipeType = "";
		this.recipeTime = "";
		this.recipeIngredients = [];
		this.recipeInstructions = "";
		this.recipeErrorMessages = {};
		this.confirmDelete = false;
	    },
	    makeChangeButton: function (recipe) {
	      this.replaceRecipeInServer(recipe._id);
	    },
	    deleteButton: function (recipe) {
	      if(this.confirmDelete) {
	        this.deleteRecipeFromServer(recipe._id);    
	      }
	      this.confirmDelete = true;
	    },
	    getFullRecipeButton: function (recipe) {
	      this.getSingleRecipeFromServer(recipe._id);
	      this.displayRecipes = false;
	      this.displayFullRecipe = true;
	    },
	    getRecipesFromServer: function () {
	      var path = "/recipes?";
	      console.log(this.orderByField);
	      if(this.orderByField) {
		path += "orderBy=" + this.orderByField + "&";
	        console.log(path);
	      } 
	      if(this.filterName) {
		path += "filterName=" + this.filterName + "&";
	      } 
	      if(this.filterType) {
		path += "filterType=" + this.filterType + "&";
	      } 
	      if(this.filterTime) {
		path += "filterTime=" + this.filterTime + "&";
	      }
	      if(this.filterIngredients) {
		path += "filterIngredients=" + this.filterIngredients + "&";
	      }
	      if(path == "/recipes?") {
		path = "/recipes";
	      }
	      fetch(SERVER_URL + path, {
		credentials: 'include'
	      }).then((response) => {
		if(response.status == 401) {
		  this.displayLogin = true;
		  this.displayRecipes = false;
		}
	      	response.json().then((data) => {
		  console.log("loaded recipes from the server:", data);
		  this.recipes = data;
		});
	      });
	    },
	    getSingleRecipeFromServer: function(recipeID) { 
	      fetch(SERVER_URL + "/recipes/" + recipeID, {
		credentials: 'include'
	      }).then((response) => {
		response.json().then((data) => {
		  this.fullRecipe = data;
		});
	      });
	    },
	    deleteRecipeFromServer: function(recipeID) { 
		fetch(SERVER_URL + "/recipes/" + recipeID, {
		  method: "DELETE",
		  credentials: 'include',
		}).then((response) => {
		  if (response.status == 200) {
		    this.getRecipesFromServer();
		    this.goBackButton();
		    this.confirmDelete = false;
	 	    console.log("Recipe deleted succesfully");
		  } else {
		    console.error("Failed to delete recipe on server");
		  }
		});
	    },
	    replaceRecipeInServer: function(recipeID) { 
		if (!(this.validateRecipe())) {
		  return;
		}
		var data = "name=" + encodeURIComponent(this.recipeName);
		data += "&type=" + encodeURIComponent(this.recipeType);
		data += "&time=" + encodeURIComponent(this.recipeTime);
		this.recipeIngredients.trim();
		try {
		  var ingredients = this.recipeIngredients.split('\n');
                  for(i in ingredients) {
                    data += "&ingredients=" + encodeURIComponent(ingredients[i]);
		  }
		} catch {
		  data += "&ingredients=" + encodeURIComponent(this.recipeIngredients);
		}
		this.recipeIngredients.trim();    
		try {
		  var instructions = this.recipeInstructions.split('\n');
		  for(i in instructions) {
		    data += "&instructions=" + encodeURIComponent(instructions[i]);
		  }
		} catch {
		  data += "&instructions=" + encodeURIComponent(this.recipeInstructions);
		}
		fetch(SERVER_URL + "/recipes/" + recipeID, {
		  method: "PUT",
		  body: data,
		  credentials: 'include',
		  headers: {
	 	    "Content-Type": "application/x-www-form-urlencoded"
		  }
		}).then((response) => {
		  if (response.status == 200) {
		    this.getRecipesFromServer();  
		    this.getSingleRecipeFromServer(recipeID);
		    this.goBackToFull();
	 	    console.log("Recipe edited:", this.recipeName);
		  } else {
		    console.error("Failed to edit recipe on server");
	    	  }
		});
	    },
	    //getSessionFromServer: function () {
            //  fetch(SERVER_URL + "/session", {
            //    credentials: 'include'
            //  }).then((response) => {
            //    response.json().then((data) => {
            //      console.log("session data:", data);
            //	    this.sessionData = data;
            //    });
            //  });
	    //},
	    logoutButton: function () {
	      fetch(SERVER_URL + "/session", {
		method: "DELETE",
		credentials: "include"
	      }).then((response) => {
	        if(response.status == 204) {
		  this.displayAdd = false;
                  this.displayUpdate = false;
                  this.displayFullRecipe = false;
                  this.displayRecipes = false;
                  this.displayLogin = true;
                  this.recipeName = "";
                  this.recipeType = "";
                  this.recipeTime = "";
                  this.recipeIngredients = [];
                  this.recipeInstructions = "";
                  this.recipeErrorMessages = {};
                  this.confirmDelete = false;
		  console.log("logged out successfully");
		} else {
		  console.log("failure to logout");
		}
	      });
	    },
	},

	created: function () {
	  this.getRecipesFromServer();
	}


}).mount("#app");
