/**
 * Created by Alexander on 23/4/2017.
 */
var mongoose = require('mongoose');
var async = require('async');

var User, Race, Place, Waypoint;

var rightnow = new Date();
var one_hour = 3600000;
var one_day = 24 * one_hour;

var dateBeforeYesterday = new Date(rightnow);
dateBeforeYesterday.setDate(dateBeforeYesterday.getDate() - 2);

var dateTomorrow = new Date(rightnow);
dateTomorrow.setDate(dateTomorrow.getDate() + 1);

var user_beheerder_id = mongoose.Types.ObjectId();
var user_player1_id = mongoose.Types.ObjectId();
var user_player2_id = mongoose.Types.ObjectId();
var user_player3_id = mongoose.Types.ObjectId();
var user_player4_id = mongoose.Types.ObjectId();

var race_freerace_id = mongoose.Types.ObjectId();
var race_strictrace_id = mongoose.Types.ObjectId();
var race_optionalrace_id = mongoose.Types.ObjectId();
var race_completedrace_id = mongoose.Types.ObjectId();

var place_1_id = mongoose.Types.ObjectId();
var place_2_id = mongoose.Types.ObjectId();
var place_3_id = mongoose.Types.ObjectId();
var place_4_id = mongoose.Types.ObjectId();

var waypoint_1_id = mongoose.Types.ObjectId();
var waypoint_2_id = mongoose.Types.ObjectId();
var waypoint_3_id = mongoose.Types.ObjectId();
var waypoint_4_id = mongoose.Types.ObjectId();
var waypoint_5_id = mongoose.Types.ObjectId();
var waypoint_6_id = mongoose.Types.ObjectId();
var waypoint_7_id = mongoose.Types.ObjectId();
var waypoint_8_id = mongoose.Types.ObjectId();
var waypoint_9_id = mongoose.Types.ObjectId();
var waypoint_10_id = mongoose.Types.ObjectId();
var waypoint_11_id = mongoose.Types.ObjectId();
var waypoint_12_id = mongoose.Types.ObjectId();
var waypoint_13_id = mongoose.Types.ObjectId();
var waypoint_14_id = mongoose.Types.ObjectId();
var waypoint_15_id = mongoose.Types.ObjectId();

var userTestDataArray = [{
    _id: user_beheerder_id,
    username: 'manager',
    password: '123',
    roles: ['manager']
}, {
    _id: user_player1_id,
    username: 'player1',
    password: '123',
    roles: []
}, {
    _id: user_player2_id,
    username: 'player2',
    password: '123',
    roles: []
}, {
    _id: user_player3_id,
    username: 'player3',
    password: '123',
    roles: []
}, {
    _id: user_player4_id,
    username: 'player4',
    password: '123',
    roles: 'admin'
}];

var raceTestDataArray = [{
    _id: race_freerace_id,
    name: 'freerace',
    startdate: dateBeforeYesterday,
    enddate: dateTomorrow,
    competitors: [user_player1_id, user_player2_id]
}, {
    _id: race_strictrace_id,
    name: 'strictrace',
    startdate: new Date('2017-05-01'),
    enddate: new Date('2017-07-04'),
    competitors: [user_player1_id, user_player3_id, user_player4_id]
}, {
    _id: race_optionalrace_id,
    name: 'optionalrace',
    startdate: new Date('2017-06-01'),
    enddate: new Date('2017-08-04'),
    competitors: [user_player1_id, user_player2_id, user_player3_id, user_player4_id]
}, {
    _id: race_completedrace_id,
    name: 'completedrace',
    startdate: new Date('2017-03-01'),
    enddate: new Date('2017-03-04'),
    competitors: [user_player1_id, user_player2_id, user_player3_id, user_player4_id]
}];

var placeTestDataArray = [{
    _id: place_1_id,
    name: 'Friends',
    googleplaceid: 'ChIJKysDiozuxkcR4tHn_uNvOaM',
}, {
    _id: place_2_id,
    name: 'Baskent',
    googleplaceid: 'ChIJg8NeRmLuxkcR7gOh6AoYOPs',
}, {
    _id: place_3_id,
    name: 'Starbucks',
    googleplaceid: 'ChIJ1TiTfYruxkcRaswMaoh97Is',
}, {
    _id: place_4_id,
    name: 'Startlight',
    googleplaceid: 'ChIJYcOxO2LuxkcRYRuoLjf8_zA',
}];

var waypointTestDataArray = [{
    _id: waypoint_1_id,
    name: 'Friendly waypoint',
    race: race_freerace_id,
    place: place_1_id,
    order: null
}, {
    _id: waypoint_2_id,
    name: 'Free basket',
    race: race_freerace_id,
    place: place_2_id,
    order: null
}, {
    _id: waypoint_3_id,
    name: 'Free starbucks',
    race: race_freerace_id,
    place: place_3_id,
    order: 1
}, {
    _id: waypoint_4_id,
    name: 'Free starlight',
    race: race_freerace_id,
    place: place_4_id,
    order: 2
},

    {
        _id: waypoint_5_id,
        name: 'Strict friends',
        race: race_strictrace_id,
        place: place_1_id,
        order: 1
    }, {
        _id: waypoint_6_id,
        name: 'Strict second',
        race: race_strictrace_id,
        place: place_2_id,
        order: 2
    }, {
        _id: waypoint_7_id,
        name: 'Point 3',
        race: race_strictrace_id,
        place: place_3_id,
        order: 3
    }, {
        _id: waypoint_8_id,
        name: 'District light',
        race: race_strictrace_id,
        place: place_4_id,
        order: 4
    },

    {
        _id: waypoint_9_id,
        name: '1',
        race: race_optionalrace_id,
        place: place_1_id,
        order: 1
    }, {
        _id: waypoint_10_id,
        name: '2',
        race: race_optionalrace_id,
        place: place_2_id,
        order: null
    }, {
        _id: waypoint_11_id,
        name: '3',
        race: race_optionalrace_id,
        place: place_3_id,
        order: 4
    },

    {
        _id: waypoint_12_id,
        name: 'n1',
        race: race_completedrace_id,
        place: place_1_id,
        order: 1
    }, {
        _id: waypoint_13_id,
        name: 'n2',
        race: race_completedrace_id,
        place: place_2_id,
        order: 2
    }, {
        _id: waypoint_14_id,
        name: 'n3',
        race: race_completedrace_id,
        place: place_3_id,
        order: 3
    }, {
        _id: waypoint_15_id,
        name: 'n4',
        race: race_completedrace_id,
        place: place_4_id,
        order: 4
    }
];

function saveCallback(err) {
    if (err) {
        console.log('Fill testdata failed, reason: %s', err)
    }
};

function fillTestUsers(printToConsole) {
    User.find({}, function(err, data) {
        if (data.length == 0) {
            if (printToConsole) {
                console.log('Creating users testdata, amount of users to create:' + userTestDataArray.length);
            }

            var tempHashUser = new User();

            for (var userIndex = 0; userIndex < userTestDataArray.length; userIndex++) {
                if (!Array.isArray(userTestDataArray[userIndex].roles)) {
                    userTestDataArray[userIndex].roles = [userTestDataArray[userIndex].roles];
                }

                userTestDataArray[userIndex].password = tempHashUser.generateHash(userTestDataArray[userIndex].password);

                User.collection.insert(userTestDataArray[userIndex], function(error, document) {
                    if (error) {
                        saveCallback(error);
                    }
                });
            }

            if (printToConsole) {
                console.log('Created user testdata');
            }
        }
    });
};

function fillTestRaces(printToConsole) {
    Race.find({}, function(err, data) {
        if (data.length == 0) {
            if (printToConsole) {
                console.log('Creating races testdata, amount of races to create:' + raceTestDataArray.length);
            }

            for (var raceIndex = 0; raceIndex < raceTestDataArray.length; raceIndex++) {
                Race.collection.insert(raceTestDataArray[raceIndex], function(error, document) {
                    if (error) {
                        saveCallback(error);
                    }
                });
            }

            if (printToConsole) {
                console.log('Created race testdata');
            }
        }
    });
};

function fillTestPlaces(printToConsole) {
    Place.find({}, function(err, data) {
        if (data.length == 0) {
            if (printToConsole) {
                console.log('Creating places testdata, amount of places to create:' + placeTestDataArray.length);
            }

            for (var placeIndex = 0; placeIndex < placeTestDataArray.length; placeIndex++) {
                Place.collection.insert(placeTestDataArray[placeIndex], function(error, document) {
                    if (error) {
                        saveCallback(error);
                    }
                });
            }

            if (printToConsole) {
                console.log('Created place testdata');
            }
        }
    });
};

function fillTestWaypoints(printToConsole) {
    Waypoint.find({}, function(err, data) {
        if (data.length == 0) {
            if (printToConsole) {
                console.log('Creating waypoints testdata, amount of waypoints to create:' + waypointTestDataArray.length);
            }

            for (var waypointIndex = 0; waypointIndex < waypointTestDataArray.length; waypointIndex++) {
                Waypoint.collection.insert(waypointTestDataArray[waypointIndex], function(error, document) {
                    if (error) {
                        saveCallback(error);
                    }
                });
            }

            if (printToConsole) {
                console.log('Created waypoint testdata');
            }
        }
    });
};


function fillAllData(printToConsole, optionalCallback) {
    printToConsole = printToConsole || false;
    console.log('Fill testdata started');
    async.parallel([
        function() {
            fillTestUsers(printToConsole);
        },
        function() {
            fillTestRaces(printToConsole);
        },
        function() {
            fillTestPlaces(printToConsole);
        },
        function() {
            fillTestWaypoints(printToConsole);
        }
    ], function() {
        if (optionalCallback) {
            optionalCallback();
        }
    });
};

module.exports = function(model) {
    User = model.User;
    Race = model.Race;
    Place = model.Place;
    Waypoint = model.Waypoint;

    return {
        fillDataIfNotExists: fillAllData,
        refillData: function(printToConsole, optionalCallback) {
            async.parallel(
                [
                    function(cb) {
                        User.remove({}, function(error) {
                            if (error) {
                                saveCallback(error);
                            }
                            cb();
                        });
                    },
                    function(cb) {
                        Race.remove({}, function(error) {
                            if (error) {
                                saveCallback(error);
                            }
                            cb();
                        });
                    },
                    function(cb) {
                        Place.remove({}, function(error) {
                            if (error) {
                                saveCallback(error);
                            }
                            cb();
                        });
                    },
                    function(cb) {
                        Waypoint.remove({}, function(error) {
                            if (error) {
                                saveCallback(error);
                            }
                            cb();
                        });
                    }
                ],
                function() {
                    fillAllData(printToConsole, optionalCallback);
                }
            );
        }
    };
}