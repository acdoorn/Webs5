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
    var result = places;

    if (req.params.name) {
        query.name = req.params.name;
        //result = Place.find(query);

        if (query.name) {
            console.log("Filtering: ");
            result = Place.whereName(result, req.query.name);
            console.log("Filtered: ");
            console.log(result);
            console.log("----------");
            console.log("----------");
            console.log("----------");
        }

    }

    res.json(result);
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
