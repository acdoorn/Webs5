var handleError, Place;

function getPlaces(req, res) {
    var query = {};

    if (req.params.name) { // http://localhost:3000/places/<name>
        query.name = req.params.name;
    }

    if (req.query.name) { // http://localhost:3000/places?name=<name>
        query.name = req.query.name
    }
    var result = Place.find(query);

    console.log('places');


    result.find(query).lean().exec(function (err, places) {
        Place.getGoogleData(places, function (err, result) {
            if (err) {
                return handleError(req, res, 500, err);
            }
            res.json(places);
        });
    });
}

function addPlace(req, res) {
    Place.findOne({name: req.body.name}).exec(function (err, placeWithSameName) {
        if (err) {
            return handleError(req, res, 400, err);
        }
        if (placeWithSameName) {
            console.log(placeWithSameName);
            res.json("There is already a place with the same name.");
        }
        Place.findOne({googleplaceid: req.body.googleplaceid}).exec(function (err, placeWithSameLocation) {
            if (err) {
                return handleError(req, res, 400, err);
            } else if (placeWithSameLocation) {
                res.json("There is already a place with the same location.");
            } else {
                new Place(req.body).save(function (err, savedPlace) {
                    if (err) {
                        return handleError(req, res, 400, err);
                    } else {
                        Place.findById(savedPlace._id).select('-_id -__v').exec(function (err, place) {
                            if (err) {
                                return handleError(req, res, 500, err);
                            }

                            res.status(200);
                            res.json(place);
                        });
                    }
                });
            }
        });
    });
}

function updatePlace(req, res) {
    var query = {};

    if (req.params.name) { // http://localhost:3000/races/<name>
        query.name = req.params.name;
    }

    if (req.query.name) { // http://localhost:3000/races?name=<name>
        query.name = req.query.name
    }
    if (!query.name) {
        error = [];
        error.status = 404;
        error.message = 'Place not found';
        return handleError(req, res, 404, error);
    }
    Place.findOneAndUpdate(
        query,
        req.body,
        function (err, savedPlace) {
            if (err) {
                return handleError(req, res, 404, err);
            }
            if (!savedPlace) {
                console.log("savedPlace");
                error = [];
                error.status = 404;
                error.message = 'Place not found';
                return handleError(req, res, 404, error);
            }
            Place.findById(savedPlace._id).select('-_id -__v').exec(function (err, place) {
                if (err) {
                    return handleError(req, res, 500, err);
                }

                res.status(200);
                res.json(place);
            });
        });
}

function deletePlace(req, res) {
    Place.findOne({
        name: req.params.name.toLowerCase()
    }).exec(function (err, place) {
        if (err) {
            return handleError(req, res, 404, err);
        }
        if (!place) {
            error = [];
            error.status = 404;
            error.message = 'Place not found';
            return handleError(req, res, 404, error);
        }
        place.remove();
        res.status(200);
        res.end();
    });
}

/* GET home page. */

module.exports = function(model, errCallback) {
  Place = model.Place;
  handleError = errCallback;

    return {
        getPlaces: getPlaces,
        addPlace: addPlace,
        updatePlace: updatePlace,
        deletePlace: deletePlace
    }
};
