// Load environment variables FIRST
require('dotenv').config();

// Verify .env is loaded
if (!process.env.MONGODB_URI) {
    console.error('❌ ERROR: MONGODB_URI not found in environment variables!');
    console.error('Make sure .env file exists in the project root with MONGODB_URI');
    process.exit(1);
}

const express = require('express');
const app = express();
const port = 8080;
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const methodOverride = require("method-override");
const mongoose = require('mongoose');
const connectDB = require('./config/database');
const Post = require('./models/Post');

// Connect to MongoDB
connectDB();

app.set('view engine', 'ejs');
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

// Configure Multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = path.join(__dirname, 'public', 'uploads');
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)'));
    }
};

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit (increased from 5MB)
    fileFilter: fileFilter
});


// Routes
app.get("/", async (req, res) => {
    try {
        const postsCount = await Post.countDocuments();
        res.render("home.ejs", { postsCount });
    } catch (error) {
        console.error('Error fetching posts count:', error);
        res.render("home.ejs", { postsCount: 0 });
    }
});

app.get("/posts", async (req, res) => {
    try {
        const posts = await Post.find().sort({ createdAt: -1 }); // Newest first
        res.render("index.ejs", { posts });
    } catch (error) {
        console.error('Error fetching posts:', error);
        res.render("index.ejs", { posts: [] });
    }
});

app.get("/posts/new", (req, res) => {
    res.render("new.ejs");
});

app.post("/posts", upload.single('image'), async (req, res) => {
    try {
        const { username, content } = req.body;
        let image = null;
        
        if (req.file) {
            image = '/uploads/' + req.file.filename;
        }
        
        // Determine post type
        let postType = 'text';
        if (image && content) {
            postType = 'mixed';
        } else if (image) {
            postType = 'image';
        }
        
        // Get user information
        const userIP = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'];
        const userAgent = req.headers['user-agent'];
        
        const post = new Post({
            username,
            content,
            image,
            userIP,
            userAgent,
            postType
        });
        
        const savedPost = await post.save();
        
        // Log post creation with details
        console.log('📝 New Post Created and Saved to MongoDB:');
        console.log(`   User: @${username}`);
        console.log(`   Post ID: ${savedPost._id}`);
        console.log(`   Database: ${savedPost.db.databaseName}`);
        console.log(`   Collection: ${savedPost.collection.name}`);
        console.log(`   Content: ${content.substring(0, 50)}${content.length > 50 ? '...' : ''}`);
        console.log(`   Type: ${postType}`);
        console.log(`   Has Image: ${image ? 'Yes' : 'No'}`);
        console.log(`   IP Address: ${userIP}`);
        console.log(`   Created At: ${savedPost.createdAt}`);
        console.log('─────────────────────────────────────');
        
        res.redirect("/posts");
    } catch (error) {
        console.error('Error creating post:', error);
        if (error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).send(`
                <html>
                    <head><title>File Too Large</title></head>
                    <body style="font-family: Arial; text-align: center; padding: 50px;">
                        <h1 style="color: #e74c3c;">File Too Large</h1>
                        <p>The file you're trying to upload exceeds the 10MB limit.</p>
                        <p>Please choose a smaller image file.</p>
                        <a href="/posts/new" style="color: #3498db; text-decoration: none;">← Go Back</a>
                    </body>
                </html>
            `);
        }
        res.redirect("/posts/new");
    }
});

app.get("/posts/:id", async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.redirect("/posts");
        }
        
        // Update view count and last viewed time
        post.viewCount = (post.viewCount || 0) + 1;
        post.lastViewedAt = new Date();
        await post.save();
        
        res.render("show.ejs", { post });
    } catch (error) {
        console.error('Error fetching post:', error);
        res.redirect("/posts");
    }
});

app.patch("/posts/:id", upload.single('image'), async (req, res) => {
    try {
        const { content } = req.body;
        const post = await Post.findById(req.params.id);
        
        if (!post) {
            return res.redirect("/posts");
        }
        
        post.content = content;
        
        // Handle image update
        if (req.file) {
            // Delete old image if exists
            if (post.image) {
                const oldImagePath = path.join(__dirname, 'public', post.image);
                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                }
            }
            // Set new image
            post.image = '/uploads/' + req.file.filename;
        }
        
        // Update post type
        if (post.image && post.content) {
            post.postType = 'mixed';
        } else if (post.image) {
            post.postType = 'image';
        } else {
            post.postType = 'text';
        }
        
        await post.save();
        
        // Log post update
        console.log('✏️ Post Updated:');
        console.log(`   Post ID: ${post._id}`);
        console.log(`   User: @${post.username}`);
        console.log(`   Updated At: ${post.updatedAt}`);
        console.log('─────────────────────────────────────');
        
        res.redirect("/posts");
    } catch (error) {
        console.error('Error updating post:', error);
        if (error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).send(`
                <html>
                    <head><title>File Too Large</title></head>
                    <body style="font-family: Arial; text-align: center; padding: 50px;">
                        <h1 style="color: #e74c3c;">File Too Large</h1>
                        <p>The file you're trying to upload exceeds the 10MB limit.</p>
                        <p>Please choose a smaller image file.</p>
                        <a href="/posts/${req.params.id}/edit" style="color: #3498db; text-decoration: none;">← Go Back</a>
                    </body>
                </html>
            `);
        }
        res.redirect("/posts");
    }
});

app.get("/posts/:id/edit", async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.redirect("/posts");
        }
        res.render("edit.ejs", { post });
    } catch (error) {
        console.error('Error fetching post for edit:', error);
        res.redirect("/posts");
    }
});

app.delete("/posts/:id", async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        
        if (post) {
            // Log post deletion
            console.log('🗑️ Post Deleted:');
            console.log(`   Post ID: ${post._id}`);
            console.log(`   User: @${post.username}`);
            console.log(`   Content: ${post.content.substring(0, 50)}${post.content.length > 50 ? '...' : ''}`);
            console.log(`   Created At: ${post.createdAt}`);
            console.log(`   Total Views: ${post.viewCount || 0}`);
            console.log('─────────────────────────────────────');
            
            // Delete associated image file if exists
            if (post.image) {
                const imagePath = path.join(__dirname, 'public', post.image);
                if (fs.existsSync(imagePath)) {
                    fs.unlinkSync(imagePath);
                }
            }
            
            await Post.findByIdAndDelete(req.params.id);
        }
        
        res.redirect("/posts");
    } catch (error) {
        console.error('Error deleting post:', error);
        res.redirect("/posts");
    }
});

// Global error handler for multer and other errors
app.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).send(`
                <html>
                    <head>
                        <title>File Too Large</title>
                        <style>
                            body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #f5f5f5; }
                            .container { background: white; padding: 40px; border-radius: 10px; max-width: 500px; margin: 0 auto; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
                            h1 { color: #e74c3c; margin-bottom: 20px; }
                            p { color: #555; margin: 10px 0; }
                            a { display: inline-block; margin-top: 20px; padding: 10px 20px; background: #3498db; color: white; text-decoration: none; border-radius: 5px; }
                            a:hover { background: #2980b9; }
                        </style>
                    </head>
                    <body>
                        <div class="container">
                            <h1>⚠️ File Too Large</h1>
                            <p>The file you're trying to upload exceeds the <strong>10MB</strong> limit.</p>
                            <p>Please choose a smaller image file and try again.</p>
                            <a href="javascript:history.back()">← Go Back</a>
                        </div>
                    </body>
                </html>
            `);
        }
        return res.status(400).send(`
            <html>
                <head><title>Upload Error</title></head>
                <body style="font-family: Arial; text-align: center; padding: 50px;">
                    <h1 style="color: #e74c3c;">Upload Error</h1>
                    <p>${err.message}</p>
                    <a href="javascript:history.back()" style="color: #3498db; text-decoration: none;">← Go Back</a>
                </body>
            </html>
        `);
    }
    if (err) {
        console.error('Error:', err);
        return res.status(500).send(`
            <html>
                <head><title>Server Error</title></head>
                <body style="font-family: Arial; text-align: center; padding: 50px;">
                    <h1 style="color: #e74c3c;">Server Error</h1>
                    <p>An error occurred: ${err.message}</p>
                    <a href="/posts" style="color: #3498db; text-decoration: none;">← Go to Posts</a>
                </body>
            </html>
        `);
    }
    next();
});

app.listen(port, () => {
    console.log(`🚀 PostFlow server is running on http://localhost:${port}`);
    console.log(`📝 Visit http://localhost:${port}/posts to see all posts`);
    console.log(`💾 MongoDB database connected`);
});
