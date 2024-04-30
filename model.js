const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

mongoose.set('strictQuery', false);
mongoose.connect('mongodb+srv://GTatertots:GSKr4wyTvG6dxmO2@cluster0.9zwkxel.mongodb.net/cs4200?retryWrites=true&w=majority')

const recipeSchema = mongoose.Schema({ 
  name: {
    type: String,
    required: [true, "Recipe must have a name"]
  },
  type: {
    type: String,
    required: [true, "Recipe must have a type"]
  },
  time: {
	  type: Number,
	  required: [true, "Recipe must have a time"]
  },
  ingredients: {
	  type: [String],
	  required: [true, "Recipe must have atleast one ingredient"]
  },
  instructions: {
	  type: [String],
	  required: [true, "Recipe must have atleast one instruction"]
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
});

const Recipe = mongoose.model('Recipe', recipeSchema);

const userSchema = new mongoose.Schema({
  firstname: {
    type: String,
    required: [true, 'user must have first name']
  },
  lastname: {
    type: String,
    required: [true, 'user must have last name']
  },
  email: {
    type: String,
    unique: [true, 'email is not unique'],
    required: [true, 'user must have an email']
  },
  encryptedPassword: {
    type: String,
    required: [true, 'user must have a password']
  }
});

userSchema.methods.setEncryptedPassword = function (plainPassword) {
  var promise = new Promise((resolve, reject) => {
    bcrypt.hash(plainPassword, 12).then(hash => {
      this.encryptedPassword = hash;
      resolve();
    });
  });
  return promise;
};

userSchema.methods.verifyEncryptedPassword = function (plainPassword) {
  var promise = new Promise((resolve, reject) => {
    bcrypt.compare(plainPassword, this.encryptedPassword).then(result => {
      resolve(result);
    });
  });
  return promise;
};

const User = mongoose.model('User', userSchema);


module.exports = {
  Recipe: Recipe,
  User: User
};
