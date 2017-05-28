/**
 * Created by Alexander on 27/5/2017.
 */
var express = require('express');
var router = express.Router();
module.exports = function(model, errCallback) {

    router.get('/', function(req, res, next) {
        res.render('index', { title: 'Express' });
    });

    var places = require('./places')(model, errCallback);
    router.route('/places')
        .get(places.get)
        .post(places.add);
    router.route('/places/:name')
        .get(places.get);

    var waypoints = require('./waypoints')(model, errCallback);
    router.route('/waypoints')
        .get(waypoints.get);
    router.route('/waypoints/:name')
        .get(waypoints.get);

    var races = require('./races')(model, errCallback);
    router.route('/races')
        .get(races.get)
        .post(races.add)
        .put(races.put);
    router.route('/races/:name')
        .get(races.get)
        .put(races.put);

    var users = require('./users')(model, errCallback);
    router.route('/users')
        .get(users.get)
        .post(users.add);
    router.route('/users/:name')
        .get(users.get);

    return router;
};

