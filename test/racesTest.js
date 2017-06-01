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

describe('Testing races route', function() {
    //inscrease the timeout, googleplaces takes long to load sometimes
    this.timeout(30000);

    describe('without authentication', function() {
        describe('GET', function() {
            it('should return 4 races', function(done) {
                makeRequest('/races', 200, function(err, res) {
                    if (err) {
                        return done(err);
                    }

                    expect(res.body).to.not.be.undefined;
                    expect(res.body).to.have.length(4);

                    done();
                });
            });

            it('should return one race named completedrace', function(done) {
                makeRequest('/races/completedrace', 200, function(err, res) {
                    if (err) {
                        return done(err);
                    }

                    expect(res.body).to.not.be.undefined;
                    expect(res.body).to.have.length(1);

                    expect(res.body[0].name).to.equal("completedrace");

                    done();
                });
            });

            it('should filter on one race named optionalrace', function(done) {
                makeRequest('/races?name=optionalrace', 200, function(err, res) {
                    if (err) {
                        return done(err);
                    }

                    expect(res.body).to.not.be.undefined;
                    expect(res.body).to.have.length(1);

                    expect(res.body[0].name).to.equal("optionalrace");

                    done();
                });
            });

            it('should filter on one race named strictrace started on 2017-05-01', function(done) {
                makeRequest('/races?startdate=2017-05-01', 200, function(err, res) {
                    if (err) {
                        return done(err);
                    }

                    expect(res.body).to.not.be.undefined;
                    expect(res.body).to.have.length(1);

                    expect(res.body[0].name).to.equal("strictrace");

                    done();
                });
            });

            it('should filter on one race named optionalrace finished on 2017-08-04', function(done) {
                makeRequest('/races?enddate=2017-08-04', 200, function(err, res) {
                    if (err) {
                        return done(err);
                    }

                    expect(res.body).to.not.be.undefined;
                    expect(res.body).to.have.length(1);

                    expect(res.body[0].name).to.equal("optionalrace");

                    done();
                });
            });

            it('should filter on 4 races where player1 is a competitor', function(done) {
                makeRequest('/races?competitors=player1', 200, function(err, res) {
                    if (err) {
                        return done(err);
                    }

                    expect(res.body).to.not.be.undefined;
                    expect(res.body).to.have.length(4);

                    done();
                });
            });

            it('should filter on 4 races where player1 or player4 are competitors', function(done) {
                makeRequest('/races?competitors=player1,player4', 200, function(err, res) {
                    if (err) {
                        return done(err);
                    }

                    expect(res.body).to.not.be.undefined;
                    expect(res.body).to.have.length(4);

                    done();
                });
            });

            it('should return 4 competitors of the race with name optionalrace', function(done) {
                makeRequest('/races/optionalrace/competitors', 200, function(err, res) {
                    if (err) {
                        return done(err);
                    }

                    expect(res.body).to.not.be.undefined;
                    expect(res.body).to.have.length(4);

                    done();
                });
            });

            it('should return a 404 when trying to get the competitors of a false race', function(done) {
                makeRequest('/races/wrongracename/competitors', 404, function(err, res) {
                    if (err) {
                        return done(err);
                    }

                    done();
                });
            });
        });

        describe('POST', function() {
            it('should fail posting a race due authentication', function(done) {
                passportStub.login(new app.Model.User());
                makePost('/races', 200, {
                    name: 'race1',
                    startdate: new Date('2017-07-01'),
                    enddate: new Date('2017-07-02')
                }, function(err, res) {
                    if (err) {
                        return done(err);
                    }

                    expect(res.body).to.not.be.undefined;
                    expect(res.body[0]).to.be.undefined;

                    done();
                });
            });

            it('should fail updating a race due authentication', function(done) {
                makePut('/races/strictrace', 200, {
                    name: 'strictrace2',
                    startdate: new Date()
                }, function(err, res) {
                    if (err) {
                        return done(err);
                    }

                    expect(res.body).to.not.be.undefined;
                    expect(res.body[0]).to.be.undefined;

                    done();
                });
            });

            it('should fail deleting a race due authentication', function(done) {
                makeDelete('/races/completedrace222', 200, function(err, res) {
                    if (err) {
                        return done(err);
                    }

                    expect(res.body).to.not.be.undefined;
                    expect(res.body[0]).to.be.undefined;

                    done();
                });
            });

            it('should return a list of 5 competitors after adding a competitor to a race', function(done) {
                makePost('/races/optionalrace/competitors', 404, {
                    username: 'beheerder'
                }, function(err, res) {
                    if (err) {
                        return done(err);
                    }

                    done();
                });
            });

            it('should fail adding a competitor to a race he is already a competitor of', function(done) {
                makePost('/races/optionalrace/competitors', 404, {
                    username: 'beheerder'
                }, function(err, res) {
                    if (err) {
                        return done(err);
                    }

                    done();
                });
            });


            it('should return 404 after trying to delete one competitor from a race', function(done) {
                makeDelete('/races/optionalrace/competitors/beheerder', 404, function(err, res) {
                    if (err) {
                        return done(err);
                    }

                    done();
                });
            });
        });
    });

    describe('with authentication', function() {
        describe('POST', function() {
            it('should fail when trying to create a race the end date prior to the start date', function(done) {
                passportStub.login(new app.Model.User({
                    role: ['manager']
                }));
                makePost('/races', 200, {
                    name: 'testrace',
                    startdate: new Date('2017-07-01'),
                    enddate: new Date('2017-06-01')
                }, function(err, res) {
                    if (err) {
                        return done(err);
                    }

                    expect(res.body).to.not.be.undefined;
                    expect(res.body).to.equal("The end date can\'t be prior to the start date.");

                    done();
                });
            });
        });
    });
});