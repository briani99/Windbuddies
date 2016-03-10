// load the things we need
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
// define the schema for our business model
var businessSchema = new Schema({
    
    name: String,
    country: String,
    city: String,
    phone: String,
    email: String,
    website: String,
    
    //location  coordinates [<longitude>,<latitude>]
    geo: {
        type: [Number],
        index: '2dSphere'
    },
    longitude: Number,
    latitude: Number,
    
    kiteschool: { type: Boolean, default: true },
    kiteshop: { type: Boolean, default: false },
    barFood: { type: Boolean, default: false },

    time: { type: Date, default: Date.now },
    
    desc: String,
    
});


// create the model for users and expose it to our app
module.exports = mongoose.model('Business', businessSchema);