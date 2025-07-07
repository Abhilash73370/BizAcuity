const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema({
    url: {
        type: String,
        required: true
    },
    position: {
        x: Number,
        y: Number
    },
    size: {
        width: Number,
        height: Number
    },
    rotation: {
        type: Number,
        default: 0
    }
});

const wallDesignSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Design name is required'],
        trim: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    wallSize: {
        width: {
            type: Number,
            required: true
        },
        height: {
            type: Number,
            required: true
        }
    },
    backgroundColor: {
        type: String,
        default: '#FFFFFF'
    },
    images: [imageSchema],
    createdAt: {
        type: Date,
        default: Date.now
    },
    lastModified: {
        type: Date,
        default: Date.now
    }
});

// Update lastModified timestamp before saving
wallDesignSchema.pre('save', function(next) {
    this.lastModified = new Date();
    next();
});

const WallDesign = mongoose.model('WallDesign', wallDesignSchema);

module.exports = WallDesign; 