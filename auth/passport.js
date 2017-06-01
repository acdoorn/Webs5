/**
 * Created by Alexander on 1/6/2017.
 */
var LocalStrategy = require('passport-local').Strategy;
var passport = require('passport');

module.exports = function(User) {
    passport.serializeUser(function(user, done) {
        done(null, user._id);
    });

    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });

    var localStrategyOptions = {
        usernameField: 'username',
        passwordField: 'password',
        passReqToCallback: true
    };

    passport.use('register', new LocalStrategy(localStrategyOptions, function(req, username, password, done) {
        process.nextTick(function() {
            User.findOne({
                'username': username
            }, function(err, user) {
                if (err) {
                    return done(err);
                }

                if (user) {
                    return done(null, false, req.flash('registerMessage', 'That username is already taken.'));
                } else {
                    var newUser = new User();

                    newUser.username = username;
                    newUser.password = newUser.generateHash(password);

                    newUser.save(function(err) {
                        if (err) {
                            throw err;
                        }

                        return done(null, newUser);
                    });
                }
            });
        });
    }));

    passport.use('login', new LocalStrategy(localStrategyOptions, function(req, username, password, done) {
        User.findOne({
            'username': username
        }, 'password roles', function(err, user) {;
            if (err) {
                return done(err);
            }

            if (!user) {
                return done(null, false, req.flash('loginMessage', 'No user found.'));
            }

            if (!user.validPassword(password)) {
                return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.'));
            }

            return done(null, user);
        });
    }));

    return passport;
};