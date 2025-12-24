# PostFlow 📝

A modern, stylish RESTful blog post management system built with Express.js, EJS, and MongoDB. PostFlow provides a beautiful, intuitive interface for creating, reading, updating, and deleting posts with image upload support.

## Features

- ✨ Modern, responsive UI with Tailwind CSS
- 📝 Create, read, update, and delete posts
- 🖼️ Image upload support (JPEG, PNG, GIF, WEBP)
- 💾 MongoDB database integration for persistent storage
- 🎨 Beautiful Instagram-style feed design
- 📱 Mobile-friendly interface
- 🚀 RESTful API architecture
- ⏰ Automatic timestamps (createdAt, updatedAt)

## Tech Stack

- **Backend**: Express.js
- **Database**: MongoDB with Mongoose
- **View Engine**: EJS
- **Styling**: Tailwind CSS
- **File Upload**: Multer
- **Utilities**: Method Override, dotenv

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas account)

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up MongoDB

#### Option A: Local MongoDB

1. Install MongoDB on your system
2. Start MongoDB service:
   ```bash
   # Windows
   net start MongoDB
   
   # macOS/Linux
   sudo systemctl start mongod
   ```

#### Option B: MongoDB Atlas (Cloud)

1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Get your connection string

### 3. Configure Environment Variables

Create a `.env` file in the root directory:

```env
# For local MongoDB
MONGODB_URI=mongodb://localhost:27017/postflow

# For MongoDB Atlas
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/postflow

PORT=8080
```

### 4. Start the Server

```bash
npm start
```

### 5. Access the Application

Open your browser and navigate to:
```
http://localhost:8080
```

## Project Structure

```
postflow/
├── config/
│   └── database.js       # MongoDB connection
├── models/
│   └── Post.js          # Post schema/model
├── public/
│   ├── uploads/         # Image uploads directory
│   └── favicon.svg      # Favicon
├── views/
│   ├── home.ejs         # Home page
│   ├── index.ejs        # Posts feed
│   ├── new.ejs          # Create post form
│   ├── edit.ejs         # Edit post form
│   └── show.ejs         # Post detail page
├── index.js             # Main server file
├── package.json
└── README.md
```

## Routes

- `GET /` - Home page
- `GET /posts` - View all posts (feed)
- `GET /posts/new` - Create a new post form
- `POST /posts` - Submit a new post (with optional image)
- `GET /posts/:id` - View a specific post
- `GET /posts/:id/edit` - Edit post form
- `PATCH /posts/:id` - Update a post (with optional image update)
- `DELETE /posts/:id` - Delete a post (and associated image)

## Database Schema

### Post Model

```javascript
{
  username: String (required),
  content: String (required),
  image: String (optional, path to uploaded image),
  createdAt: Date (auto-generated),
  updatedAt: Date (auto-generated)
}
```

## Image Upload

- Supported formats: JPEG, JPG, PNG, GIF, WEBP
- Maximum file size: 5MB
- Images are stored in `public/uploads/`
- Images are automatically deleted when posts are deleted or updated

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/postflow` |
| `PORT` | Server port | `8080` |

## Troubleshooting

### MongoDB Connection Issues

1. **Local MongoDB not running**: Make sure MongoDB service is started
2. **Connection string incorrect**: Verify your `.env` file has the correct `MONGODB_URI`
3. **MongoDB Atlas**: Ensure your IP is whitelisted and credentials are correct

### Image Upload Issues

1. **File too large**: Maximum size is 5MB
2. **Invalid file type**: Only image files are allowed
3. **Upload directory**: Ensure `public/uploads/` directory exists and is writable

## Development

The application uses:
- **Mongoose** for MongoDB ODM
- **Multer** for file uploads
- **EJS** for server-side rendering
- **Tailwind CSS** for styling

## License

ISC

## Author

IQYAN ALI
