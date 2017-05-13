var express = require('express');
var router = express.Router();
var handleError, Place;

var places = [
    {name: "alex", description:"Alexander's old home", year: 2017, month: 4, day: 23},
    {name: "esther", description:"Esther's old home", year: 2017, month: 4, day: 23},
    {name: "alexandesther", description:"Alexander and Esther their new home", year: 2017, month: 7, day: 1}
];

function getPlaces(req, res) {
    var query = {};
    // Place.find({'name':req.query.name}, 'name', function(err, places) {
    //     res.json(places)});

    if (req.query.name) {
        console.log("Filtering on: " + req.query.name);
        query.name = req.query.name
    }


    Place.find(query, function(err, places) { res.json(places)});
}

/* GET home page. */

module.exports = function(model, errCallback) {
  Place = model.Place;
  handleError = errCallback;
  router.route('/')
      .get(getPlaces);
  router.route('/:name')
      .get(getPlaces);
  return router
};
