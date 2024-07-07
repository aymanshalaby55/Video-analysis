const mongoose = require('mongoose');

const AiSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    Active: {
        type: Boolean,
        default: false
    },
    UsingNumber: {
        type: Number,
        default: 0
    },
    version: {
        type: String,
        required: true,
        trim: true
    },
    trainingDataSize: {
        type: Number,
        required: true
    },
    accuracy: {
        type: Number,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    description: {
        type: String,
        trim: true
    }
});

const AiModel = mongoose.model('AiModels', AiSchema);

module.exports = AiModel;