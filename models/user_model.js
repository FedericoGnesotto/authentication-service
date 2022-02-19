const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true,
        minlength: 10
    },
    name: {
        type: String,
        required: true,
        maxLength: 100
    },
    token: {
        type: String
    }
});

module.exports = new mongoose.model("User", UserSchema);