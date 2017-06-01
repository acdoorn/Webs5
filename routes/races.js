var handleError, Race, User, Waypoint, Model;

function getRaces(req, res) {
    var query = {};

    if (req.params.name) { // http://localhost:3000/races/<name>
        query.name = req.params.name;
    }

    if (req.query.name) { // http://localhost:3000/races?name=<name>
        query.name = req.query.name
    }


    var result = Race.find(query).populate('competitors', '-_id -__v -roles').populate({path: 'waypoints', select: '-_id -__v -race', populate: {path:'place', select: '-_id name googleplaceid'}});


    if (req.query.startdate) {
        result = Race.filterOnStartdate(result, req.query.startdate);
    }
    if (req.query.enddate) {
        result = Race.filterOnEnddate(result, req.query.enddate);
    }

    result.select('-__v').lean().exec(function(err, races) {
        if (req.query.competitors) {
            var competitors = req.query.competitors.split(',');
            var removeRace;

            for (var raceIndex = races.length - 1; raceIndex >= 0; raceIndex--) {
                removeRace = true;
                for (var competitorIndex = 0; competitorIndex < races[raceIndex].competitors.length; competitorIndex++) {
                    for (var queryCompetitorIndex = 0; queryCompetitorIndex < competitors.length; queryCompetitorIndex++) {
                        if (races[raceIndex].competitors[competitorIndex].username === competitors[queryCompetitorIndex]) {
                            removeRace = false;
                            queryCompetitorIndex = competitors.length;
                            competitorIndex = races[raceIndex].competitors.length;
                        }
                    }
                }

                if (removeRace) {
                    races.splice(raceIndex, 1);
                }
            }
        }
        Model.RaceWebsocket.updateRaces();
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


function deleteRace(req, res) {
    Race.findOne({
        name: req.params.name.toLowerCase()
    }).exec(function (err, race) {
        if (err) {
            return handleError(req, res, 404, err);
        }
        if (!race) {
            error = [];
            error.status = 404;
            error.message = 'Race not found';
            return handleError(req, res, 404, error);
        }
        race.remove();
        res.status(200);
        res.end();
    });
}

function getRaceCompetitors(req, res) {
    Race.findOne({
        name: req.params.name.toLowerCase()
    }).populate('competitors', '-_id -__v -roles').lean().exec(function (err, race) {
        if (err) {
            return handleError(req, res, 404, err);
        }
        if (!race) {
            error = [];
            error.status = 404;
            error.message = 'Race not found';
            return handleError(req, res, 404, error);
        }
        res.json(race.competitors);
    });
}

function addRaceCompetitor(req, res) {
    Race.findOne({
        name: req.params.name.toLowerCase()
    }).exec(function(err, race) {
        if (err) {
            return handleError(req, res, 400, err);
        }
        if (!race) {
            error = [];
            error.status = 404;
            error.message = 'Race not found';
            return handleError(req, res, 404, error);
        }

        User.findOne({
            username: req.body.username
        }).select('_id').exec(function(err, user) {
            if (err) {
                return handleError(req, res, 400, err);
            }
            if (!user) {
                error = [];
                error.status = 404;
                error.message = 'Race not found';
                return handleError(req, res, 404, error);
            }

            if (race.competitors.indexOf(user._id) === -1) {
                race.competitors.push(user._id);

                Race.update({
                    name: race.name
                }, {
                    competitors: race.competitors
                }, function(err) {
                    if (err) {
                        res.status(500);
                        res.json(err);
                    } else {
                        res.status(200);
                        Race.findById(race._id).populate('competitors', '-_id -__v -roles').select('-_id -__v').lean().exec(function(err, race2) {
                            if (err) {
                                return handleError(req, res, 500, err);
                            }
                            console.log(req.body.username + " joined the race " + race2.name + ".");
                            Model.RaceWebsocket.sendMessageToRace(race2.name, req.body.username + " joined the race " + race2.name + ".");

                            res.json(race2.competitors);
                        });
                    }
                });

            } else {
                res.status(400);
                res.json('User is already a competitor in this race.');
            }
        });
    });
}

function deleteRaceCompetitor(req, res) {
    Race.findOne({
        name: req.params.name.toLowerCase()
    }).exec(function (err, race) {
        if (err) {
            return handleError(req, res, 404, err);
        }
        if (!race) {
            error = [];
            error.status = 404;
            error.message = 'Race not found';
            return handleError(req, res, 404, error);
        }

        User.findOne({
            username: req.params.username
        }).select('_id').exec(function (err, user) {
            if (err) {
                return handleError(req, res, 404, err);
            }
            if (!user) {
                error = [];
                error.status = 404;
                error.message = 'User not found';
                return handleError(req, res, 404, error);
            }

            var index = race.competitors.indexOf(user._id);

            if (index >= 0) {
                race.competitors.splice(index, 1);

                Race.update({
                    name: race.name
                }, {
                    competitors: race.competitors
                }, function (err) {
                    if (err) {
                        res.status(500);
                        res.json(err);
                    } else {
                        Race.findById(race._id).populate('competitors', '-_id -__v').select('-_id -__v').exec(function (err, race2) {
                            if (err) {
                                return handleError(req, res, 500, err);
                            }

                            Model.RaceWebsocket.sendMessageToRace(race2.name, req.params.username + " resigned from the race " + race2.name + ".");

                            res.status(200);
                            res.json(race2.competitors);
                        });
                    }
                });
            } else {
                res.status(404);
                res.json('User is not a competitor.');
            }
        });
    });
}


function getRaceWaypoints(req, res) {
    Race.findOne({
        name: req.params.name.toLowerCase()
    }).populate('waypoints', '-_id -__v -race').lean().exec(function (err, race) {
        if (err) {
            return handleError(req, res, 404, err);
        }
        if (!race) {
            error = [];
            error.status = 404;
            error.message = 'Race not found';
            return handleError(req, res, 404, error);
        }
        res.json(race.waypoints);
    });
}

function addRaceWaypoint(req, res) {
    Race.findOne({
        name: req.params.name.toLowerCase()
    }).exec(function(err, race) {
        if (err) {
            return handleError(req, res, 404, err);
        }
        if (!race) {
            error = [];
            error.status = 404;
            error.message = 'Race not found';
            return handleError(req, res, 404, error);
        }

        getHighestOrder(race, function(highestOrder) {

            Waypoint.findOne({
                name: req.body.name
            }).select('_id name').exec(function(err, waypoint) {
                if (err) {
                    return handleError(req, res, 404, err);
                }
                if (!waypoint) {
                    console.log('Waypoint not found');
                    error = [];
                    error.status = 404;
                    error.message = 'Waypoint not found';
                    return handleError(req, res, 404, error);
                }

                if (race.waypoints.indexOf(waypoint._id) === -1) {
                    race.waypoints.push(waypoint._id);
                    highestOrder++;;
                    console.log(highestOrder);
                    Waypoint.update({
                        _id: waypoint._id
                    }, {
                        race: race._id,
                        order: highestOrder
                    }, function(err) {
                        if (err) {
                            res.status(500);
                            res.json(err);
                        }
                    });
                    Race.update({
                        name: race.name
                    }, {
                        waypoints: race.waypoints
                    }, function(err) {
                        if (err) {
                            res.status(500);
                            res.json(err);
                        } else {
                            res.status(200);
                            Race.findById(race._id).populate('waypoints', '-_id -__v -race').select('-_id -__v').lean().exec(function(err, race) {
                                if (err) {
                                    return handleError(req, res, 500, err);
                                }

                                Model.RaceWebsocket.sendMessageToRace(race.name, req.body.waypointname + " is now a waypoint in race " + race.name + ".");

                                res.json(race.waypoints);
                            });
                        }
                    });

                } else {
                    res.status(400);
                    res.json('This waypoint is already a waypoint in this race.');
                }
            });
        });

    });
}

function getHighestOrder(race, callback) {
    var highestOrder = 0;
    race.waypoints.forEach(function (waypointId) {
        Waypoint.findOne({_id: waypointId}).exec(function (err, waypoint) {
            if (highestOrder < waypoint.order) {
                highestOrder = waypoint.order;
            }
        });
    });
    setTimeout(function() {
        callback(highestOrder);
    }, 500);
}

function deleteRaceWaypoint(req, res) {
    Race.findOne({
        name: req.params.name.toLowerCase()
    }).exec(function(err, race) {
        if (err) {
            return handleError(req, res, 404, err);
        }
        if (!race) {
            error = [];
            error.status = 404;
            error.message = 'Race not found';
            return handleError(req, res, 404, error);
        }

        Waypoint.findOne({
            name: req.params.waypointname
        }).select('_id').exec(function(err, waypoint) {
            if (err) {
                return handleError(req, res, 404, err);
            }
            if (!waypoint) {
                error = [];
                error.status = 404;
                error.message = 'Waypoint not found';
                return handleError(req, res, 404, error);
            }
            var index = race.waypoints.indexOf(waypoint._id);
            if (index >= 0) {
                race.waypoints.splice(index, 1);

                Waypoint.updateOne({
                    _id: waypoint._id
                }, {
                    race: null,
                    order: 0
                }, function(err, result) {
                    console.log(err);
                    if(err) {
                        return handleError(req, res, 500, err);
                    }
                    console.log(result);
                });

                User.find({
                    waypoint: waypoint._id
                }).exec(function(err, users) {
                    if (err) {
                        return handleError(req, res, 500, err);
                    }

                    users.forEach(function(user) {
                        user.waypoint = 0;
                    });
                });
                Race.update({
                    name: race.name
                }, {
                    waypoints: race.waypoints
                }, function(err) {
                    if (err) {
                        res.status(500);
                        res.json(err);
                    } else {
                        Race.findById(race._id).populate('waypoints', '-_id -__v -race').select('-_id -__v').exec(function(err, race) {
                            if (err) {
                                return handleError(req, res, 500, err);
                            }

                            res.status(200);

                            Model.RaceWebsocket.sendMessageToRace(race.name, req.params.waypointname + " is no longer a waypoint for this race.");
                            res.json(race.waypoints);
                        });
                    }
                });
            } else {
                res.status(404);
                res.json('Waypoint is not a waypoint for this race.');
            }
        });
    });
}

function updateRace(req, res) {
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
        error.message = 'Race not found';
        return handleError(req, res, 404, error);
    }
    Race.findOneAndUpdate(
        query,
        req.body,
        function (err, savedRace) {
            if (err) {
                return handleError(req, res, 404, err);
            }
            if (!savedRace) {
                error = [];
                error.status = 404;
                error.message = 'Race not found';
                return handleError(req, res, 404, error);
            }
            Race.findById(savedRace._id).select('-_id -__v').exec(function (err, race) {
                if (err) {
                    return handleError(req, res, 500, err);
                }

                res.status(200);
                res.json(race);
            });
        });
}

/* GET home page. */

module.exports = function(model, errCallback){
    Model = model;
    Race = model.Race;
    User = model.User;
    Waypoint = model.Waypoint;
    handleError = errCallback;
    return {
        getRace: getRaces,
        addRace: addRace,
        updateRace: updateRace,
        deleteRace: deleteRace,
        getCompetitors: getRaceCompetitors,
        addCompetitor: addRaceCompetitor,
        deleteCompetitor: deleteRaceCompetitor,
        getWaypoints: getRaceWaypoints,
        addWaypoint: addRaceWaypoint,
        deleteWaypoint: deleteRaceWaypoint
    }
};
