/**
 * Created by Alexander on 18/4/2017.
 */
var mongoose = require("mongoose");

console.log("Initializing waypoint schema");

var waypointSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    place: {
        type: mongoose.Schema.ObjectId,
        required: true,
        ref: 'Place'
    },
    order: {
        type: Number,
        required: true
    },
    race: {// used for verifying order in the current race
        type: mongoose.Schema.ObjectId,
        required: true,
        ref: 'Race'
    }
});

mongoose.model("Waypoint", waypointSchema);

/*
 TODO:
 - De benodigde extra validation
 - De benodigde static methods
 - De benodigde instance methods
 */