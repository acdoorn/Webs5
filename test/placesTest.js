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

describe('Testing places route', function() {
    //inscrease the timeout, googleplaces takes long to load sometimes
    this.timeout(30000);

    describe('without authentication', function() {
        describe('GET', function() {
            it('should return 4 places', function(done) {
                makeRequest('/places', 200, function(err, res) {
                    if (err) {
                        return done(err);
                    }

                    expect(res.body).to.not.be.undefined;
                    expect(res.body).to.have.length(4);

                    done();
                });
            });

            it('should return one place named Starbucks', function(done) {
                makeRequest('/places/Starbucks', 200, function(err, res) {
                    if (err) {
                        return done(err);
                    }

                    expect(res.body).to.not.be.undefined;
                    expect(res.body).to.have.length(1);

                    expect(res.body[0].name).to.equal("Starbucks");

                    done();
                });
            });

            it('should filter on one place named Starbucks', function(done) {
                makeRequest('/places?name=Starbucks', 200, function(err, res) {
                    if (err) {
                        return done(err);
                    }

                    expect(res.body).to.not.be.undefined;
                    expect(res.body).to.have.length(1);

                    expect(res.body[0].name).to.equal("Starbucks");

                    done();
                });
            });

            it('should filter on one place named Starbucks with the race freerace', function(done) {
                makeRequest('/places?name=Starbucks&races=freerace', 200, function(err, res) {
                    if (err) {
                        return done(err);
                    }

                    expect(res.body).to.not.be.undefined;
                    expect(res.body).to.have.length(1);

                    expect(res.body[0].name).to.equal("Starbucks");

                    done();
                });
            });


        });

        describe('POST', function() {
            it('should fail posting a place due authentication', function(done) {
                makePost('/places', 200, {
                    name: 'mazzeltof',
                    googleplaceid: 'ChIJpztOB4ruxkcRg6TOfh1KANw'
                }, function(err, res) {
                    if (err) {
                        return done(err);
                    }

                    expect(res.body).to.not.be.undefined;
                    expect(res.body[0]).to.be.undefined;

                    done();
                });
            });

            it('should fail updating a place due authentication', function(done) {
                makePost('/places', 200, {
                    name: 'Starbucks',
                    googleplaceid: 'ChIJpztOB4ruxkcRg6TOfh1KANw22'
                }, function(err, res) {
                    if (err) {
                        return done(err);
                    }

                    expect(res.body).to.not.be.undefined;
                    expect(res.body[0]).to.be.undefined;

                    done();
                });
            });

            it('should fail deleting a place due authentication', function(done) {
                makeDelete('/places/Starbucks', 200, function(err, res) {
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

    describe('with authentication', function() {
        describe('POST', function() {
            it('should return a place with the name mazzeltof after posting a place', function(done) {
                passportStub.login(new app.Model.User({
                    role: ['manager']
                }));
                makePost('/places', 200, {
                    name: 'mazzeltof',
                    googleplaceid: 'ChIJpztOB4ruxkcRg6TOfh1KANw'
                }, function(err, res) {
                    if (err) {
                        return done(err);
                    }
                    expect(res.body).to.not.be.undefined;
                    expect(res.body.name).to.equal("mazzeltof");

                    done();
                });
            });

            it('should fail when trying to create a place with the same name', function(done) {
                passportStub.login(new app.Model.User({
                    role: ['manager']
                }));
                makePost('/places', 200, {
                    name: 'mazzeltof',
                    googleplaceid: 'ChIJpztOB4ruxkcRg6TOfh1KANw'
                }, function(err, res) {
                    if (err) {
                        return done(err);
                    }

                    expect(res.body).to.not.be.undefined;
                    expect(res.body).to.equal("There is already a place with the same name.");

                    done();
                });
            });

            it('should return a updated place when trying to update a place', function(done) {
                passportStub.login(new app.Model.User({
                    role: ['manager']
                }));
                makePut('/places/mazzeltof', 200, {
                    name: 'mazzeltof2'
                }, function(err, res) {
                    if (err) {
                        return done(err);
                    }

                    expect(res.body).to.not.be.undefined;
                    expect(res.body.name).to.equal("mazzeltof2");

                    done();
                });
            });

            it('should succeed when trying to delete a place', function(done) {
                passportStub.login(new app.Model.User({
                    role: ['manager']
                }));
                makeDelete('/places/mazzeltof2', 200, function(err, res) {
                    if (err) {
                        return done(err);
                    }

                    done();
                });
            });
        });
    });
});