/**
 * Created by Alexander on 1/6/2017.
 */
var request = require('supertest');
var passportStub = require('passport-stub');
var expect = require('chai').expect;
var should = require('chai').should();

var app = require('../app');
var server = require('http').createServer(app);
app.setServer(server);

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

describe('Testing users route', function() {
    //inscrease the timeout, googleplaces takes long to load sometimes
    this.timeout(30000);

    describe('without authentication', function() {
        describe('GET', function() {
            it('should return 6 users without pagination', function(done) {
                makeRequest('/users', 200, function(err, res) {
                    if (err) {
                        return done(err);
                    }

                    expect(res.body).to.not.be.undefined;
                    expect(res.body).to.have.length(6);

                    done();
                });
            });

            it('should return 6 users with pageIndex 2 because there is no pagination', function(done) {
                makeRequest('/users?pageIndex=2', 200, function(err, res) {
                    if (err) {
                        return done(err);
                    }

                    expect(res.body).to.not.be.undefined;
                    expect(res.body).to.have.length(6);

                    done();
                });
            });

            it('should return 1 user with username player3, option 1', function(done) {
                makeRequest('/users/player3', 200, function(err, res) {
                    if (err) {
                        return done(err);
                    }

                    expect(res.body).to.not.be.undefined;
                    expect(res.body[0].username).to.equal("player3");

                    done();
                });
            });

            it('should return 1 user with username player2, option 2', function(done) {
                makeRequest('/users?username=player3', 200, function(err, res) {
                    if (err) {
                        return done(err);
                    }

                    expect(res.body).to.not.be.undefined;
                    expect(res.body[0].username).to.equal("player3");

                    done();
                });
            });

            it('should return 1 user named manager with the role manager', function(done) {
                makeRequest('/users?roles=manager', 200, function(err, res) {
                    if (err) {
                        return done(err);
                    }

                    expect(res.body).to.not.be.undefined;
                    expect(res.body[0].username).to.equal("manager");

                    done();
                });
            });
        });

        describe('POST', function() {
            it('should fail posting a user due authentication', function(done) {
                passportStub.login(new app.Model.User());
                makePost('/users', 200, {
                    username: 'player6',
                    password: '123'
                }, function(err, res) {
                    if (err) {
                        return done(err);
                    }

                    expect(res.body).to.not.be.undefined;
                    expect(res.body[0]).to.be.undefined;

                    done();
                });
            });

            it('should fail updating a user due authentication', function(done) {
                makePut('/users/player1', 200, {
                    username: 'player1a'
                }, function(err, res) {
                    if (err) {
                        return done(err);
                    }

                    expect(res.body).to.not.be.undefined;
                    expect(res.body[0]).to.be.undefined;

                    done();
                });
            });

            it('should fail deleting a user due authentication', function(done) {
                makeDelete('/users/player1', 200, function(err, res) {
                    if (err) {
                        return done(err);
                    }

                    expect(res.body).to.not.be.undefined;
                    expect(res.body[0]).to.be.undefined;

                    done();
                });
            });
        });
    });
});