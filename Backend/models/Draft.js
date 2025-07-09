const mongoose = require('mongoose');

const draftSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sharedWith: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    sharedAt: {
      type: Date,
      default: Date.now
    }
  }],
  wallData: {
    type: Object,
    required: true,
    validate: {
      validator: function(wallData) {
        // Convert wallData to BSON to check its size
        const bsonSize = Buffer.from(JSON.stringify(wallData)).length;
        // MongoDB's BSON document size limit is 16MB (16777216 bytes)
        // We'll set our limit to 15MB to be safe
        return bsonSize <= 15728640; // 15MB in bytes
      },
      message: 'Wall data exceeds maximum allowed size of 15MB'
    }
  },
  previewImage: {
    type: String,
    required: true,
    validate: {
      validator: function(preview) {
        // Ensure preview image is not too large (max 2MB)
        return Buffer.from(preview).length <= 2097152; // 2MB in bytes
      },
      message: 'Preview image exceeds maximum allowed size of 2MB'
    }
  },
    isPublic: {
      type: Boolean,
      default: false,
    },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
draftSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Clean up data before saving
draftSchema.pre('save', function(next) {
  // Ensure wallData is properly structured
  if (this.wallData) {
    // Remove any undefined or null values from arrays
    if (this.wallData.images) {
      this.wallData.images = this.wallData.images.filter(img => img);
    }
    if (this.wallData.imageStates) {
      this.wallData.imageStates = this.wallData.imageStates.filter(state => state);
    }
  }
  next();
});

module.exports = mongoose.model('Draft', draftSchema); 