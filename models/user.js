const mongoose = require('mongoose');

const useSchema = new mongoose.Schema({
    name: {
        required: true,
        type: String
    },
    password:{
        required: true,
        type: String
    },
    email:{
        required: true,
        type: String
    },
    tokens: {
        type: Number,
        required: true,
        default: 100
    },
    money: {
        type: Number,
        required: true,
        default: 0
    }
});

module.exports = mongoose.model('users', useSchema);