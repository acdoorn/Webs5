/**
 * Created by Alexander on 18/4/2017.
 */
var mongoose = require("mongoose");

console.log("Initializing user schema");

var userSchema = new mongoose.Schema({

    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        select: false
    },
    role: {
        type: String,
        required: true,
    }
});

mongoose.model("User", userSchema);

/*
 TODO: Create schema, voeg toe aan mongoose
 */

/*
 TODO: Validation
 // contains waypoints in an order
 - ID: Verplicht, int
 - Name: Verplicht, String
 - Password: Verplicht, String, cleartext
 - CurrentWaypoint: int
 - Role: Verplicht, int {
    admin: can edit waypoints, places, races and players,
    player: can join a race, can see the race he is currently playing, maximum of one race at a time, also has a current waypoint, (last location)
 }
 */

/*
 TODO:
 - De benodigde extra validation
 - De benodigde static methods
 - De benodigde instance methods
 */