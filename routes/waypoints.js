var handleError, Waypoint;

function getWaypoints(req, res) {
    var query = {};

    if (req.params.name) { // http://localhost:3000/waypoints/<name>
        query.name = req.params.name;
    }

    if (req.query.name) { // http://localhost:3000/waypoints?name=<name>
        query.name = req.query.name
    }

    var result = Waypoint.find(query).populate('race', '-_id -__v').populate('place', '-_id -__v');

    result.select('-__v').lean().exec(function(err, races) {
        res.json(races);
    });
}



function addWaypoint(req, res) {
    Waypoint.collection.insert(req.body, function (error, document) {
        if (error) {
            saveCallback(error);
        }
        res.json(document);
    });
}

/* GET home page. */

module.exports = function(model, errCallback) {
    Waypoint = model.Waypoint;
    handleError = errCallback;

    return {
        get: getWaypoints,
        add: addWaypoint
    }
};
