// load the things we need
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
// define the schema for our user model
var beachSchema = new Schema({
    
    name: String,
    country: String,
    city: String,
    time: { type: Date, default: Date.now },
    
    riderAbility: String,
    
    //location  coordinates [<longitude>,<latitude>]
    geo: {
        type: [Number],
        index: '2dSphere'
    },
    longitude: Number,
    latitude: Number,
    
    //water//
    waterType: String, 
    waterHazards: String,
    waterQuality: String,
    waterTides: String,
    
    //beach//
    beachType: String,
    beachHazards: String,
    beachSize: String,
    
    //Schools and Shops//
    school: [{ name: String, website: String }],
    shop: [{ name: String, website: String }],
    
    desc: String,
    
    windguru: String,
    
    //BestMonths: no of Windy days//
    bestMonths: { Jan: Number,
                    Feb: Number,
                    Mar: Number,
                    Apr: Number,
                    May: Number,
                    June: Number,
                    July: Number,
                    Aug: Number,
                    Sept: Number,
                    Oct: Number,
                    Nov: Number,
                    Dec: Number},
    
    
    //BestDirections, red yellow green //
    direction: {N: Number, 
                NE: Number,
                E: Number,
                SE: Number,
                S: Number,
                SW: Number,
                W: Number,
                NW: Number}
    
});
// create the model for users and expose it to our app
module.exports = mongoose.model('Beach', beachSchema);