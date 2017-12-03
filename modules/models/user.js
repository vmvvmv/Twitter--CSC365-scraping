'use strict';
// app/models/user.js
// load the things we need
let mongoose = require('mongoose');
let bcrypt   = require('bcrypt-nodejs');

// define the schema for our user model
let userSchema = mongoose.Schema({

	local            : {
		email        : String,
		password     : String,
	},
	facebook         : {
		id           : String,
		token        : String,
		email        : String,
		name         : String
	},
	twitter          : {
		id           : String,
		token        : String,
		tokenSecret: String,
		displayName  : String,
		username     : String
	},
	google           : {
		id           : String,
		token        : String,
		email        : String,
		name         : String
	}

});

// checking if password is valid using bcrypt
userSchema.methods.validPassword = function(password) {
	return bcrypt.compareSync(password, this.local.password);
};


// this method hashes the password and sets the users password
userSchema.methods.hashPassword = function(password) {
	let user = this;

	// hash the password
	bcrypt.hash(password, null, null, function(err, hash) {
		// if (err)
		// 	return next(err);

		user.local.password = hash;
	});

};

// create the model for users and expose it to our app
module.exports = mongoose.model('User', userSchema);