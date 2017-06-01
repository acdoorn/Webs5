var handleError, Waypoint, Place;

function getWaypoints(req, res) {
    var query = {};

    if (req.params.name) { // http://localhost:3000/waypoints/<name>
        query.name = req.params.name;
    }

    if (req.query.name) { // http://localhost:3000/waypoints?name=<name>
        query.name = req.query.name
    }

    var result = Waypoint.find(query).populate('place', '-_id -__v').populate('race', '-_id name'); // 592d5aa61ffbcb3674830cec

    result.select('-__v').lean().exec(function(err, waypoints) {
        res.json(waypoints);
    });
}

function addWaypoint(req, res) {
    var waypoint = new Waypoint(req.body);
    Waypoint.findOne({name: waypoint.name}).exec(function (err, waypointWithSameName) {
        if (err) {
            return handleError(req, res, 400, err);
        } else if (waypointWithSameName) {
            res.json("There is already a waypoint with the same name.");
        } else {
            waypoint.save(function (err, savedWaypoint) {
                if (err) {
                    return handleError(req, res, 400, err);
                } else {
                    Waypoint.findById(savedWaypoint._id).select('-_id -__v').exec(function (err, waypoint) {
                        if (err) {
                            return handleError(req, res, 500, err);
                        }

                        res.status(200);
                        res.json(waypoint);
                    });
                }
            });
        }
    });
}

function updateWaypoint(req, res) {
    if (!req.body.place) {
        res.status(400);
        res.json("The field place is required.");
    } else {
        Race.findOne({
            name: req.body.race
        }).select('_id').exec(function (err, race) {
            if (err) {
                return handleError(req, res, 404, err);
            }
            if (!race) {
                req.body.race = null;
            } else {
                req.body.race = race._id;
            }

            Place.findOne({
                name: req.body.place
            }).select('_id').exec(function (err, place) {

                if (err) {
                    return handleError(req, res, 404, err);
                }
                if (!place) {
                    error = [];
                    error.status = 404;
                    error.message = 'Place not found';
                    return handleError(req, res, 404, error);
                }

                req.body.place = place._id;

                Waypoint.findOneAndUpdate({
                        name: req.params.name
                    },
                    req.body,
                    function (err, savedWaypoint) {
                        if (err) {
                            return handleError(req, res, 400, err);
                        } else {
                            req.params.savedId = savedWaypoint._id;
                            req.params.name = null;

                            getWaypoints(req, res);
                        }
                    }
                );
            });
        });
    }
}

function deleteWaypoint(req, res) {
    Waypoint.findOne({
        name: req.params.name
    }).exec(function(err, waypoint) {
        if (err || !waypoint) {
            return handleError(req, res, 404, err || 'Waypoint not found');
        } else {
            waypoint.remove();
            res.status(200);
            res.end();
        }
    });
}

function getWaypointPlace(req, res) {
    Waypoint.findOne({
        name: req.params.name.toLowerCase()
    }).populate('place', '-_id -__v').lean().exec(function (err, waypoint) {
        if (err) {
            return handleError(req, res, 404, err);
        }
        if (!waypoint) {
            error = [];
            error.status = 404;
            error.message = 'Waypoint not found';
            return handleError(req, res, 404, error);
        }
        if(!waypoint.place) {
            error = [];
            error.status = 404;
            error.message = 'Waypoint does not have a place';
            return handleError(req, res, 404, error);
        }
        var tempPlace = [waypoint.place];

        Place.getGoogleData(tempPlace, function (err, result) {
            if (err) {
                return handleError(req, res, 500, err);
            }
            res.json(tempPlace);
        });
    });
}
/* GET home page. */

module.exports = function(model, errCallback) {
    Waypoint = model.Waypoint;
    Place = model.Place;
    handleError = errCallback;

    return {
        getWaypoints: getWaypoints,
        addWaypoint: addWaypoint,
        updateWaypoint: updateWaypoint,
        deleteWaypoint: deleteWaypoint,
        getWaypointPlace: getWaypointPlace
    }
};
