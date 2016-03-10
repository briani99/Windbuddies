// load the things we need
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// define the schema for our user model
var activitySchema = new Schema({
    
    name: String,
    beach: { type: Schema.Types.ObjectId, ref: 'Beach' },
    kite : { type : String, size: Number, Year: Number},
    time: { type: Date, default: Date.now },
    
    loc: { type: 'string', coordinates: [[['number']]] },
    
});

// create the model for users and expose it to our app
module.exports = mongoose.model('Activity', activitySchema);