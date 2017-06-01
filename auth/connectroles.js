/**
 * Created by Alexander on 1/6/2017.
 */
var ConnectRoles = require('connect-roles');

module.exports = function() {
    var roles = new ConnectRoles({
        failureHandler: function(req, res, action) {
            if (req.isAuthenticated()) {
                res.render('access-denied', {
                    action: action
                });
            } else {
                res.render('account/login', {
                    title: 'Login',
                    message: req.flash('loginMessage')
                });
            }
        }
    });

    roles.use('manage', function(req) {
        if (req.user && req.user.hasRole('manager')) {
            return true;
        }
    });

    roles.use(function(req) {
        if (req.user && req.user.hasRole('admin')) {
            return true;
        }
    });

    return roles;
};