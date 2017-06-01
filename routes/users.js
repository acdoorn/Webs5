var handleError, User, Waypoint, Model;

function getUsers(req, res) {
    var query = {};

    if (req.params.username) { // http://localhost:3000/users/<name>
        query.username = req.params.username;
    }

    if (req.query.username) { // http://localhost:3000/users?name=Starbucks
        query.username = req.query.username
    }
    var result = User.find(query).populate({path: 'waypoint', select: '-_id -__v', populate: {path:'place race', select: '-_id name googleplaceid'}}); // 592d5aa61ffbcb3674830cec

    result.select('-__v').lean().exec(function(err, users) {
        if(err) {
            return handleError(req, res, 400, err);
        }
        res.json(users);
    });
}

function addUser(req, res) {
    var user = new User(req.body);

    user.password = user.generateHash(user.password);
    User.findOne({username: user.username}).exec(function (err, userWithSameUsername) {
        if (err) {
            return handleError(req, res, 400, err);
        } else if (userWithSameUsername) {
            res.json("There is already a user with the same username.");
        } else {
            if (req.body.roles) {
                user.roles = req.body.roles.split(",");
            }

            user.save(function (err, savedUser) {
                if (err) {
                    return handleError(req, res, 400, err);
                } else {
                    User.findById(savedUser._id).select('-_id -__v').exec(function (err, user) {
                        if (err) {
                            return handleError(req, res, 500, err);
                        }

                        res.status(200);
                        res.json(user);
                    });
                }
            });
        }
    });
}

function updateUser(req, res) {
    var user = new User();

    if (req.body.password) {
        req.body.password = user.generateHash(req.body.password);
    }
    if (req.body.roles) {
        req.body.roles = req.body.roles.split(",");
    }

    if(req.body.waypoint) {
        Waypoint.findOne({
            name: req.body.waypoint
        }).exec(function(err, waypoint) {
            if (err) {
                return handleError(req, res, 404, err);
            }
            if (!waypoint) {
                error = [];
                error.status = 404;
                error.message = 'Waypoint not found';
                return handleError(req, res, 404, error);
            }
            console.log(waypoint._id);
            req.body.waypoint = waypoint._id;
            Model.RaceWebsocket.sendMessageToRace(waypoint.race.name, req.params.username + " is currently at waypoint " + waypoint.name + ".");
            User.updateOne({
                    username: req.params.username
                },
                req.body,
                function(err, savedUser) {
                    if (err) {
                        console.log(err);
                        console.log(req.body);
                        return handleError(req, res, 404, err);
                    }
                    if (!savedUser) {
                        error = [];
                        error.status = 404;
                        error.message = 'User not found';
                        return handleError(req, res, 404, error);
                    }
                    req.params.username = savedUser.username;
                    req.query.username = null;

                    return res.json(savedUser);
                }
            );
        });
    } else {
        User.updateOne({
                username: req.params.username
            },
            req.body,
            function (err, savedUser) {
                if (err) {
                    console.log(err);
                    console.log(req.body);
                    return handleError(req, res, 404, err);
                }
                if (!savedUser) {
                    error = [];
                    error.status = 404;
                    error.message = 'User not found';
                    return handleError(req, res, 404, error);
                }
                req.params.username = savedUser.username;
                req.query.username = null;
                res.json(savedUser);
            }
        );
    }
}

function deleteUser(req, res) {
    User.findOne({
        username: req.params.username
    }).exec(function(err, user) {
        if (err) {
            return handleError(req, res, 404, err);
        }
        if (!user) {
            error = [];
            error.status = 404;
            error.message = 'User not found';
            return handleError(req, res, 404, error);
        }
        user.remove();
        res.status(200);
        res.end();
    });
}

function setWaypoint(req, res) {
    User.findOne({
        username: req.params.username
    }).exec(function(err, user) {
        if (err) {
            return handleError(req, res, 404, err);
        }
        if (!user) {
            error = [];
            error.status = 404;
            error.message = 'User not found';
            return handleError(req, res, 404, error);
        }
        Waypoint.findOne({
            name: req.body.name
        }).populate('race','name').select('-_id -__v').exec(function(err, waypoint) {
            if (err) {
                return handleError(req, res, 404, err);
            }
            if (!waypoint) {
                error = [];
                error.status = 404;
                error.message = 'Waypoint not found';
                return handleError(req, res, 404, error);
            }
            User.updateOne({username: user.username}, {waypoint: waypoint}, function(err, result) {
                if(err) {
                    return handleError(req, res, 500, err);
                }

                Model.RaceWebsocket.sendMessageToRace(waypoint.race.name, user.username + " is currently at waypoint " + waypoint.name + ".");

                res.json(result);
            });
        });
    })
}

function deleteWaypoint(req, res) {
    User.findOne({
        username: req.params.username
    }).exec(function(err, user) {
        if (err) {
            return handleError(req, res, 404, err);
        }
        if (!user) {
            error = [];
            error.status = 404;
            error.message = 'User not found';
            return handleError(req, res, 404, error);
        }

        User.updateOne({username: user.username}, {waypoint: null}, function (err, result) {
            if (err) {
                return handleError(req, res, 500, err);
            }

            res.json(result);
        });
    });
}

module.exports = function(model, errCallback) {
    User = model.User;
    Waypoint = model.Waypoint;
    Model = model;
    handleError = errCallback;
    return  {
        getUsers: getUsers,
        addUser: addUser,
        updateUser: updateUser,
        deleteUser: deleteUser,
        setWaypoint: setWaypoint,
        deleteWaypoint: deleteWaypoint
    }
};
