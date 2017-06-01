var googleApi = require('../config/googleapi');
var https = require('https');
var async = require('async');

module.exports = function(mongoose, Model, handleError) {
    var placeSchema = new mongoose.Schema({
        name: {
            type: String,
            required: true,
            unique: true,
            lowercase: true
        },
        googleplaceid: {
            type: String,
            required: true
        }
    });

    placeSchema.statics.getGoogleData = function(placesArray, callback) {
        if (!Array.isArray(placesArray)) {
            placesArray = [placesArray];
        }

        var googleApiFunction = function(place, apiCallback) {
            var googleTimeoutTime = googleApi.timeout;
            var googleTimeoutError = "The GoogleAPI Threw an unknown error, or took to long to load.";

            var timeoutWrapper = function(googleRequest) {
                return function() {
                    place.googledata = googleTimeoutError;
                    apiCallback();
                    googleRequest.destroy();
                };
            };

            var googleRequest = https.get(googleApi.baseUrl + '/maps/api/place/details/json?key=' + googleApi.key + '&placeid=' + place.googleplaceid, function(res) {
                var data = '';

                res.on('data', function(chunk) {
                    data += chunk;
                    clearTimeout(googleTimeout);
                    googleTimeout = setTimeout(googleTimeoutWrapperFunction, googleTimeoutTime);
                }).on('end', function() {
                    clearTimeout(googleTimeout);
                    place.googledata = JSON.parse(data);
                    apiCallback();
                }).on('error', function(err) {
                    clearTimeout(googleTimeout);
                    place.googledata = googleTimeoutError;
                    apiCallback();
                });
            }).on('error', function() { /* catch any errors called by the https, the errors are catched in the timeoutWrapper. */ });

            var googleTimeoutWrapperFunction = timeoutWrapper(googleRequest);


            var googleTimeout = setTimeout(googleTimeoutWrapperFunction, googleTimeoutTime);
        };

        var doneFunction = function(err) {
            if (callback) {
                callback(err, placesArray);
            }
        }

        async.each(placesArray, googleApiFunction, doneFunction);
    };

    placeSchema.statics.getPlaces = function(name) {
        var result = this.find();

        return result.where('name').equals(name);
    };


    placeSchema.pre('remove', function(next) {
        Model.Waypoint.remove({
            place: this._id
        }).exec(function(err) {
            if (err) {
                next(err);
            }
        });

        next();
    });



    return mongoose.model("Place", placeSchema);
}

/*
 TODO: Create schema, voeg toe aan mongoose
 */

/*
 TODO: Validation
 // a place on the map, like new york pizza
 - ID: Verplicht, unique int
 - Name: Verplicht, String
 - LocationID: Verplicht, String
 */

/*
 TODO:
 - De benodigde extra validation
 - De benodigde static methods
 - De benodigde instance methods
 */