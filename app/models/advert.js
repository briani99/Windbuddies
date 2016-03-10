// load the things we need
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
// define the schema for our user model
var advertSchema = new Schema({
    
    beach: { type: Schema.Types.ObjectId, ref: 'Beach' },
    active: Boolean,
    time: { type: Date, default: Date.now },
    desc: String,
    image: String,
    userBusiness: { type: Schema.Types.ObjectId, ref: 'User' },
});

// create the model for users and expose it to our app
module.exports = mongoose.model('Advert', advertSchema);