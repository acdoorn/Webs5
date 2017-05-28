/**
 * Created by Alexander on 18/4/2017.
 */
module.exports = function(mongoose, Model, handleError) {
    var raceSchema = new mongoose.Schema({
        name: {
            type: String,
            required: true,
            unique: true,
            lowercase: true
        },
        startdate: {
            type: Date,
            required: true
        },
        enddate: {
            type: Date,
            required: true
        },
        competitors: [{
            type: mongoose.Schema.ObjectId,
            required: true,
            ref: 'User'
        }],
        waypoints: [{
            type: mongoose.Schema.ObjectId,
            required: true,
            ref: 'Waypoint'
        }]

    });


    raceSchema.methods.addWaypoint = function (waypoint) {
        if (raceSchema.waypoints.size > 1) {
            raceSchema.waypoints.forEach(function (currentWaypoint) {
                if (currentWaypoint.order === waypoint.order) return false;
            });
            raceSchema.waypoints.splice(waypoint.order - 1, 0, waypoint);
            return true;
        } else {
            raceSchema.waypoints.add(waypoint);
            return true;
        }
    };

    raceSchema.methods.removeWaypoint = function (waypoint) {
        if (raceschema.waypoints.size > 0) {
            raceSchema.waypoints.delete(waypoint);
        }
    }
    return mongoose.model("Race", raceSchema);
}

/*
 TODO:
 - De benodigde extra validation
 - De benodigde static methods
 - De benodigde instance methods
 */