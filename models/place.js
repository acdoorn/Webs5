module.exports = function(mongoose, Model, handleError) {
    var placeSchema = new mongoose.Schema({
        name: {
            type: String,
            required: true,
            unique: true,
            lowercase: true
        },
        googleplaceid: {
            type: String,
            required: true
        }
    });
    placeSchema.statics.whereName = function(name) {
        var result = this.find();

        return result.where('name').equals(name);
    };

    return mongoose.model("Place", placeSchema);
}

/*
 TODO: Create schema, voeg toe aan mongoose
 */

/*
 TODO: Validation
 // a place on the map, like new york pizza
 - ID: Verplicht, unique int
 - Name: Verplicht, String
 - LocationID: Verplicht, String
 */

/*
 TODO:
 - De benodigde extra validation
 - De benodigde static methods
 - De benodigde instance methods
 */