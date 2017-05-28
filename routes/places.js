var handleError, Place;

function getPlaces(req, res) {
    var query = {};

    if (req.params.name) { // http://localhost:3000/places/<name>
        query.name = req.params.name;
    }

    if (req.query.name) { // http://localhost:3000/places?name=<name>
        query.name = req.query.name
    }
    Place.find(query, function(err, places) { res.json(places)});
}

function addPlace(req, res) {
    Place.collection.insert(req.body, function (error, document) {
        if (error) {
            saveCallback(error);
        }
        res.json(document);
    });
}

/* GET home page. */

module.exports = function(model, errCallback) {
  Place = model.Place;
  handleError = errCallback;

    return {
        get: getPlaces,
        add: addPlace
    }
};
