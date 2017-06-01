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

describe('Testing index route', function() {
    describe('without authentication', function() {
        describe('GET', function() {
            it('should return 200 for home page', function(done) {
                makeRequest('/', 200, function(err, res) {
                    if (err) {
                        return done(err);
                    }

                    done();
                });
            });

            it('should return 200 for login page', function(done) {
                makeRequest('/login', 200, function(err, res) {
                    if (err) {
                        return done(err);
                    }

                    done();
                });
            });

            it('should return 302 for logout page, redirect to index', function(done) {
                makeRequest('/logout', 302, function(err, res) {
                    if (err) {
                        return done(err);
                    }

                    expect(res.headers.location).to.equal("/");
                    done();
                });
            });

            it('should return 200 for register page', function(done) {
                makeRequest('/register', 200, function(err, res) {
                    if (err) {
                        return done(err);
                    }

                    done();
                });
            });

            it('should return 302 for profile page, redirect to login', function(done) {
                makeRequest('/profile', 302, function(err, res) {
                    if (err) {
                        return done(err);
                    }

                    expect(res.headers.location).to.equal("/login");
                    done();
                });
            });
        });

        describe('POST', function() {
            it('login without password: should fail and redirect to login page', function(done) {
                makePost('/login', 302, {
                    username: 'player1'
                }, function(err, res) {
                    if (err) {
                        return done(err);
                    }

                    expect(res.headers.location).to.equal("/login");

                    done();
                });
            });

            it('login with wrong username: should fail and redirect to login page', function(done) {
                makePost('/login', 302, {
                    username: 'player5',
                    password: '123'
                }, function(err, res) {
                    if (err) {
                        return done(err);
                    }

                    expect(res.headers.location).to.equal("/login");

                    done();
                });
            });

            it('login with incorrect pass: should fail and redirect to login page', function(done) {
                makePost('/login', 302, {
                    username: 'player1',
                    password: '1234'
                }, function(err, res) {
                    if (err) {
                        return done(err);
                    }

                    expect(res.headers.location).to.equal("/login");

                    done();
                });
            });


            it('login: should success and redirect to profile page', function(done) {
                makePost('/login', 302, {
                    username: 'player1',
                    password: '123'
                }, function(err, res) {
                    if (err) {
                        return done(err);
                    }

                    expect(res.headers.location).to.equal("/profile");

                    done();
                });
            });

            it('register: should success and redirect to profile page', function(done) {
                makePost('/register', 302, {
                    username: 'player500',
                    password: '123'
                }, function(err, res) {
                    if (err) {
                        return done(err);
                    }

                    expect(res.headers.location).to.equal("/profile");

                    done();
                });
            });

            it('register with existing username: should fail and redirect to register page', function(done) {
                makePost('/register', 302, {
                    username: 'player1',
                    password: '123'
                }, function(err, res) {
                    if (err) {
                        return done(err);
                    }

                    expect(res.headers.location).to.equal("/register");

                    done();
                });
            });
        });
    });

    describe('with authentication', function() {
        describe('GET', function() {
            it('should return 302 for home page, to redirect to /profile', function(done) {
                passportStub.login(new app.Model.User());
                makeRequest('/', 302, function(err, res) {
                    if (err) {
                        return done(err);
                    }

                    expect(res.headers.location).to.equal("/profile");
                    done();
                });
            });

            it('should return 302 for login page, to redirect to /profile', function(done) {
                passportStub.login(new app.Model.User());
                makeRequest('/login', 302, function(err, res) {
                    if (err) {
                        return done(err);
                    }

                    expect(res.headers.location).to.equal("/profile");
                    done();
                });
            });

            it('should return 302 for logout page, redirect to index', function(done) {
                passportStub.login(new app.Model.User());
                makeRequest('/logout', 302, function(err, res) {
                    if (err) {
                        return done(err);
                    }

                    expect(res.headers.location).to.equal("/");
                    done();
                });
            });

            it('should return 302 for register page, redirect to profile', function(done) {
                passportStub.login(new app.Model.User());
                makeRequest('/register', 302, function(err, res) {
                    if (err) {
                        return done(err);
                    }

                    expect(res.headers.location).to.equal("/profile");
                    done();
                });
            });

            it('should return 200 for profile page', function(done) {
                passportStub.login(new app.Model.User());
                makeRequest('/profile', 200, function(err, res) {
                    if (err) {
                        return done(err);
                    }

                    done();
                });
            });
        });
    });
});