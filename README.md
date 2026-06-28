# RetroStream — Posts Forum (Exercise 4)

A posts forum built with an MVC architecture, MongoDB, and full CRUD over fetch.
Part of the RetroStream project.

## Exercise project structure
```text
project/
├── models/
│   └── postModel.js          # Mongoose Post schema (Model)
├── controllers/
│   └── postController.js     # request handlers (Controller)
├── routes/
│   └── postRoutes.js         # /posts routes (Routes)
├── views/
│   └── feed.html             # forum page (View)
├── public/
│   ├── css/
│       └── feed.css          # styling
│   └── js/
│       └── feed.js           # client fetch + DOM rendering
├── config/
│   └── db.js                 # MongoDB connection
├── server.js                 # app entry point
├── .env                      # MONGO_URI (not committed)
├── .gitignore
└── README.md

```

## MVC overview
| Layer | File | Role |
|-------|------|------|
| Model | `models/postModel.js` | Post schema: title, content, author + timestamps |
| Controller | `controllers/postController.js` | logic for each request |
| Routes | `routes/postRoutes.js` | maps HTTP methods to controllers |
| View | `views/feed.html` + `public/js/feed.js` | client that fetches and renders |

## Setup
1. install dependencies
```bash
npm install
```
2. Create a `.env` file in the root with a MongoDB connection string.
You can use a local MongoDB or a MongoDB Atlas cluster:
```bash
# local MongoDB
MONGO_URI=mongodb://localhost:27017/RetroStream

# or MongoDB Atlas
MONGO_URI=your_atlas_connection_string
```

3. run server
```bash
node server.js
```
4. Log in at http://localhost:3000
```text
login with template user - user@example.com / password: 123456
```
5. Open this in your browser:
```text
http://localhost:3000/feed - Posts feed
```

## API routes
Base URL:
```text
http://localhost:3000/posts
```

### Create post
```http
POST /posts
```
Example body:
```json
{
  "title": "My first post",
  "author": "Niv",
  "content": "Hello RetroStream!"
}
```

### Get posts
```http
GET /posts
```

### Update post
```http
PUT /posts/:id
```
Example body:
```json
{
  "title": "Updated title",
  "author": "Niv",
  "content": "Updated content"
}
```

### Delete post
```http
DELETE /posts/:id
```


