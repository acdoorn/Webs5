var raceNamespace, handleError;

var initRaceWebsocket = function(server, errorHandler, Model) {
    var updateRaces = function() {
        Model.Race.find().exec(function(err, races) {
            if (err) {
                raceNamespace.emit('error', handleError(req, res, 500, err));
            }

            var emitData = [];

            races.forEach(function(race) {
                emitData.push(race.name);
            });

            raceNamespace.emit('races', JSON.stringify(emitData));
        });
    };

    var sendMessageToRace = function(race, message) {
        raceNamespace.to(race).emit('message', message);
    };

    var RaceWebsocket = function(server, errorHandler, Model) {
        var namespace = '/races';
        var io = require('socket.io')(server);
        raceNamespace = io.of(namespace);
        handleError = errorHandler;

        raceNamespace.on('connection', function(socket) {
            socket.on('disconnect', function() {
                socket.leave(socket.race);
            });

            socket.on('enter race', function(race) {

                if (socket.currentRace) {
                    socket.leave(socket.currentRace);
                }

                socket.join(race);
                socket.currentRace = socket.race = race;

                raceNamespace.connected[socket.id].emit("message", "You started watching the " + race + "!");
            });

            updateRaces();
        });

        console.log("Hosted raceWebsocket namespace: " + namespace);
    };

    var raceWebsocket = new RaceWebsocket(server, errorHandler, Model);

    raceWebsocket.updateRaces = function() {
        updateRaces();
    };
    raceWebsocket.sendMessageToRace = function(race, message) {
        sendMessageToRace(race, message);
    };

    return raceWebsocket;
};



module.exports = initRaceWebsocket;