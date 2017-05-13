var mongoose = require('mongoose');

module.exports = function() {
    mongoose.connect('mongodb://localhost:27017/restrace'); //local
    //mongoose.connect('mongodb://acdoorn:acdoorn@ds143330.mlab.com:43330/acdoornwebs5');
    mongoose.Promise = require('q').Promise;
    return mongoose;
}