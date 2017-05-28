var handleError, User;

function getUsers(req, res) {
    var query = {};

    if (req.params.name) { // http://localhost:3000/users/<name>
        query.name = req.params.name;
    }

    if (req.query.name) { // http://localhost:3000/users?name=Starbucks
        query.name = req.query.name
    }
    User.find(query, function(err, users) { res.json(users)});
}

function addUser(req, res) {
    User.collection.insert(req.body, function (error, document) {
        if (error) {
            saveCallback(error);
        }
        res.json(document);
    });
}

/* GET home page. */

module.exports = function(model, errCallback) {
    User = model.User;
    handleError = errCallback;
    return  {
        get: getUsers,
        add: addUser
    }
};
