var handleError, Race;

function getRaces(req, res) {
    var query = {};

    if (req.params.name) { // http://localhost:3000/races/<name>
        query.name = req.params.name;
    }

    if (req.query.name) { // http://localhost:3000/races?name=<name>
        query.name = req.query.name
    }
    var result = Race.find(query).populate('competitors', '-_id -__v -roles').populate({path: 'waypoints', select: '-_id -__v -race', populate: {path:'place', select: '-_id name googleplaceid'}});

    if (req.query.startdatetime) {
        result = Race.filterOnStartdatetime(result, req.query.startdatetime);
    }
    if (req.query.enddatetime) {
        result = Race.filterOnEnddatetime(result, req.query.enddatetime);
    }

    result.select('-__v').lean().exec(function(err, races) {
        res.json(races);
    });
}


function addRace(req, res) {
    var race = new Race(req.body);
    if (race.enddate <= race.startdate) {
        res.status(200);
        res.json("The end date can\'t be prior to the start date.");
    } else {
        Race.findOne({name: race.name}).exec(function(err, raceWithSameName) {
            if(err) {
                return handleError(req, res, 400, err);
            } else if(raceWithSameName) {
                res.json("There is already a race with the same name.");
            } else {
                race.save(function(err, savedRace) {
                    if (err) {
                        return handleError(req, res, 400, err);
                    } else {
                        Race.findById(savedRace._id).select('-_id -__v').exec(function(err, race) {
                            if (err) {
                                return handleError(req, res, 500, err);
                            }

                            res.status(200);
                            res.json(race);
                        });
                    }
                });
            }
        });
    }
}

function updateRace(req, res) {
    var query = {};

    if (req.params.name) { // http://localhost:3000/races/<name>
        query.name = req.params.name;
    }

    if (req.query.name) { // http://localhost:3000/races?name=<name>
        query.name = req.query.name
    }
    if(!query.name) {
        return handleError(req, res, 404, err || "Race not found");
    }
    Race.findOneAndUpdate(
        query,
        req.body,
        function (err, savedRace) {
            if (err || !savedRace) {
                return handleError(req, res, 404, err || "Race not found");
            } else {
                Race.findById(savedRace._id).select('-_id -__v').exec(function (err, race) {
                    if (err) {
                        return handleError(req, res, 500, err);
                    }

                    res.status(200);
                    res.json(race);
                });
            }
        });

}

/* GET home page. */

module.exports = function(model, errCallback){
    Race = model.Race;
    handleError = errCallback;
    return {
        get: getRaces,
        add: addRace,
        put: updateRace
    }
};
