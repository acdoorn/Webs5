/**
 * Created by Alexander on 1/6/2017.
 */
var request = require('supertest');
var passportStub = require('passport-stub');
var expect = require('chai').expect;
var should = require('chai').should();

var app = require('../app');

passportStub.install(app);

function makeRequest(route, statusCode, done) {
    request(app)
        .get(route)
        .expect(statusCode)
        .end(function(err, res) {
            if (err) {
                return done(err);
            }

            done(null, res);
        });
};

function makePost(route, statusCode, data, done) {
    request(app)
        .post(route)
        .send(data)
        .expect(statusCode)
        .end(function(err, res) {
            if (err) {
                return done(err);
            }

            done(null, res);
        });
};

function makePut(route, statusCode, data, done) {
    request(app)
        .put(route)
        .send(data)
        .expect(statusCode)
        .end(function(err, res) {
            if (err) {
                return done(err);
            }

            done(null, res);
        });
};

function makeDelete(route, statusCode, done) {
    request(app)
        .del(route)
        .expect(statusCode)
        .end(function(err, res) {
            if (err) {
                return done(err);
            }

            done(null, res);
        });
};

app.Model.TestData.refillData(false);

describe('Testing app', function() {
    it('should return 404 for /returna404', function(done) {
        makeRequest('/returna404', 404, function(err, res) {
            if (err) {
                return done(err);
            }

            done();
        });
    });

    it('should trigger the development errorHandler', function(done) {
        app.Model.User.findOne({
            _id: 'invalidValue'
        }).exec(function(err, user) {
            if(!err) {
                err = [];
                err.message = "testing value, no error but value just isn't found";
            }
            app.handleError({
                params: 'empty params',
                body: 'empty body',
                app: app
            }, {
                status: function(status) {
                    expect(status).to.equal(500);
                    done();
                },
                json: function() {}
            }, 500, err);
        });
    });
});