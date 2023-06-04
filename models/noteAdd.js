const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
    topic: {
        required: true,
        type: String
    },
    class:{
        required: true,
        type: String
    },
    subject:{
        required: true,
        type: String
    },
    filePath:{
        required: true,
        type: String
    },
    userId: {
        required: true,
        type: String
    },
    date:{
        required: true,
        type: Date,
        default: new Date()
    }
});

module.exports = mongoose.model('notes', noteSchema);