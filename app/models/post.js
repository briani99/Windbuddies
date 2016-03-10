// load the things we need
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
// define the schema for our user model
//var User       = require('./user.js');


var postSchema = new Schema({
    //Core Paramters
    beach     : { type: Schema.Types.ObjectId, ref: 'Beach' },
    user      : { type: Schema.Types.ObjectId, ref: 'User' },
    username  : String,
    time      : { type: Date, default: Date.now },
    type      : String,
    // 1.Simple Post
    subject   : String,
    // 2.Weather Post
    knots     : Number,
    direction : Number,
    // 3.Activity Post
    activity  : { type: Schema.Types.ObjectId, ref: 'Activity' },
    
    
    // Likes and Comments of all posts
    
    comments  : [{  text : String,
                    time : { type: Date, default: Date.now },
                    user : { type: Schema.Types.ObjectId, ref: 'User' },
                    username: String
                }],
    commentsCnt: { type: Number, default: 0 },
    
    likesCnt  :  { type: Number, default: 0 },
    userlikes : [{ type: Schema.Types.ObjectId, ref: 'User' }]
});
// create the model for users and expose it to our app
module.exports = mongoose.model('Post', postSchema);