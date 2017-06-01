/**
 * Created by Alexander on 18/4/2017.
 */
var bcrypt = require('bcrypt-nodejs');
var _ = require('underscore');
module.exports = function(mongoose, Model, handleError) {
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
            required: false,
        },
        waypoint: {// used for verifying where user is located in the current race, null if didn't check in yet
            type: mongoose.Schema.ObjectId,
            required: false,
            ref: 'Waypoint'
        }
    });


    userSchema.methods.generateHash = function(password) {
        return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
    };

    userSchema.methods.validPassword = function(password) {
        return bcrypt.compareSync(password, this.password);
    };

    userSchema.methods.hasRole = function(roles) {
        var returnVal = false;
        if(roles) {
            if (!Array.isArray(roles)) {
                roles = [roles];
            }
            if (this.role) {
                var lowerCaseRole = this.role.toLowerCase();

                roles.forEach(function (role) {
                    if (lowerCaseRole === role.toLowerCase()) {
                        returnVal = true;
                    }
                });
            }
        }
        return returnVal;
    };

    return mongoose.model("User", userSchema);
}
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