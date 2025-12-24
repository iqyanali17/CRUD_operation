const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        trim: true,
        index: true // Index for faster queries by username
    },
    content: {
        type: String,
        required: true,
        trim: true
    },
    image: {
        type: String,
        default: null
    },
    // User tracking information
    userIP: {
        type: String,
        default: null
    },
    userAgent: {
        type: String,
        default: null
    },
    postType: {
        type: String,
        enum: ['text', 'image', 'mixed'],
        default: 'text'
    },
    // Statistics
    viewCount: {
        type: Number,
        default: 0
    },
    lastViewedAt: {
        type: Date,
        default: null
    }
}, {
    timestamps: true // Adds createdAt and updatedAt fields
});

// Index for faster queries
postSchema.index({ username: 1, createdAt: -1 });
postSchema.index({ createdAt: -1 });

const Post = mongoose.model('Post', postSchema);

module.exports = Post;

