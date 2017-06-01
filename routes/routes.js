/**
 * Created by Alexander on 27/5/2017.
 */
var express = require('express');
var router = express.Router();
module.exports = function(model, roles, passport, errCallback) {

    var places = require('./places')(model, errCallback);
    router.route('/places')
        .get(places.getPlaces)
        .post(roles.can('manage'), places.addPlace);
    router.route('/places/:name')
        .get(places.getPlaces)
        .put(roles.can('manage'), places.updatePlace)
        .delete(roles.can('manage'), places.deletePlace);

    var waypoints = require('./waypoints')(model, errCallback);
    router.route('/waypoints')
        .get(waypoints.getWaypoints)
        .post(roles.can('manage'), waypoints.addWaypoint);
    router.route('/waypoints/:name')
        .get(waypoints.getWaypoints)
        .put(roles.can('manage'), waypoints.updateWaypoint)
        .delete(roles.can('manage'), waypoints.deleteWaypoint);
    router.route('/waypoints/:name/place')
        .get(waypoints.getWaypointPlace);

    var races = require('./races')(model, errCallback);
    router.route('/races')
        .get(races.getRace)
        .post(roles.can('manage'), races.addRace);
    router.route('/races/:name')
        .get(races.getRace)
        .put(roles.can('manage'), races.updateRace)
        .delete(roles.can('manage'), races.deleteRace);
    router.route('/races/:name/competitors')
        .get(races.getCompetitors)
        .post(races.addCompetitor);
    router.route('/races/:name/competitors/:username')
        .delete(races.deleteCompetitor);
    router.route('/races/:name/waypoints')
        .get(races.getWaypoints)
        .post(races.addWaypoint);
    router.route('/races/:name/waypoints/:waypointname')
        .delete(races.deleteWaypoint);

    var users = require('./users')(model, errCallback);
    router.route('/users')
        .get(users.getUsers)
        .post(roles.can('manage'), users.addUser);
    router.route('/users/:username')
        .get(users.getUsers)
        .put(roles.can('manage'), users.updateUser)
        .delete(roles.can('manage'), users.deleteUser);
    router.route('/users/:username/waypoint')
        .post(users.setWaypoint)
        .delete(users.deleteWaypoint);

// standard login stuff
    router.route('/')
        .get(function(req, res, next) {
            if (req.isAuthenticated()) {
                res.redirect('/profile');
            } else {
                res.render('index', {
                    title: 'Home'
                });
            }
        });

    router.route('/login')
        .get(function(req, res) {
            if (req.isAuthenticated()) {
                res.redirect('/profile');
            } else {
                res.render('account/login', {
                    title: 'Login',
                    message: req.flash('loginMessage')
                });
            }

        })
        .post(passport.authenticate('login', {
            successRedirect: '/profile',
            failureRedirect: '/login',
            failureFlash: true
        }));

    router.route('/logout')
        .get(function(req, res) {
            req.logout();
            res.redirect('/');
        });

    router.route('/register')
        .get(function(req, res) {
            if (req.isAuthenticated()) {
                res.redirect('/profile');
            } else {
                res.render('account/register', {
                    title: 'Register',
                    message: req.flash('registerMessage')
                });
            }
        })
        .post(passport.authenticate('register', {
            successRedirect: '/profile',
            failureRedirect: '/register',
            failureFlash: true
        }));

    router.route('/profile')
        .get(function(req, res) {
            if (!req.isAuthenticated()) {
                res.redirect('/login');
            } else {
                res.render('account/profile', {
                    title: 'Race Of Rest',
                    canAccessManagement: req.user && req.user.hasRole('manager')
                });
            }
        });

    return router;
};

