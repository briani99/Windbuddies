// load the things we need
var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');
var Schema = mongoose.Schema;

var Beach       = require('./beach.js');

// define the schema for our user model
var userSchema = mongoose.Schema({
    
    //Details
    username: String,
    firstname : String,
    lastname : String,
    dob : Date,
    sex : String,
    country: String,
    avatar : { type: String, default: 'https://s3-eu-west-1.amazonaws.com/kiteloop/public/img/avatar.png' },
    
    //Kite History
    yearStarted : Number,
    created: { type: Date, default: Date.now },
    updated: { type: Date, default: Date.now },
    
    //Logon and Social media Details
    local            : {
        email        : String,
        password     : String,
        resetPasswordToken: String,
        resetPasswordExpires: Date
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
        displayName  : String,
        username     : String
    },
    instagram        : {
        id           : String,
        token        : String,
        displayName  : String,
        username     : String
    },
    
    google           : {
        id           : String,
        token        : String,
        email        : String,
        name         : String
    },
    
    
    //Technical Details 
    admin: Boolean,
    premium : Boolean,
    business: Boolean,
    businessName: String,
    
    
    beaches : [{type: Schema.Types.ObjectId, ref: 'Beach' }],            
    favbeach: {type: Schema.Types.ObjectId, ref: 'Beach' },
               
    kites : [{ kite : String, size: Number, Year: Number}]

});

// generating a hash
userSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
userSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.local.password);
};

userSchema.methods.getBeaches = function(callback) {
    Beach.find({'_id': { $in: this.beaches }}, function(err, b) {
        if (err) return next(err);
            callback(b);
    });      
};

// create the model for users and expose it to our app
module.exports = mongoose.model('User', userSchema);
