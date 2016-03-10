// load the things we need
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
// define the schema for our user model

var windstatSchema = new Schema({
    //Core Paramters
    beach     : { type: Schema.Types.ObjectId, ref: 'Beach' },
    time      : { type: Date, default: Date.now },
    knots     : Number,
    direction : Number
});
// create the model for users and expose it to our app
module.exports = mongoose.model('WindStat', windstatSchema);