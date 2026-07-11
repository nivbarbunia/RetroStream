# RetroStream

A Netflix-style streaming platform for Israeli nostalgia content (90s/2000s series and movies), built with Node.js, Express, MongoDB, and JavaScript in an MVC architecture.

Users browse a catalog of series and movies by category or search, watch content in a custom video player that resumes where they left off, rate and review titles, and explore extras like the show's real-world filming location on a map and a related nostalgic YouTube clip. Each account supports multiple profiles (like Netflix), and admins get a full back-office to manage users, content, and view analytics.

## Features

### Viewer experience
- **Multi-profile accounts** — each user account can hold several profiles (name, avatar, birth date), Netflix-style profile switcher on login.
- **Category browsing** — navbar links for Series, Movies, Channels, 90s, 2000s, and "My List", each rendering its own hero + curated rows. Categories with a channel/genre dimension get a multi-column dropdown sub-filter (CSS3 `column-count`).
- **Two search modes** — a quick free-text/navbar search, and a second "advanced search" mode (genre / channel / decade / minimum rating) that behaves like its own full-page category, chip-based like the admin search.
- **Content modal with 3 tabs**:
  - **Watch** — custom video player (play/pause, mute, seek bar, fullscreen, live time) that saves and resumes playback progress per profile.
  - **Reviews** — 1–5 star rating + optional text, one review per profile per title (edit/delete your own), sortable by newest or highest-rated, toggle between all reviews and just yours.
  - **Details** — the title's real-world filming location plotted on Google Maps, and an embedded YouTube clip related to the content.
- **Likes & continue watching** — like/unlike titles, resume unfinished titles from a "Continue Watching" row, recommendations based on watch history.
- **Responsive retro UI** — RTL Hebrew interface, custom scanline/glow visual theme, Bootstrap 5 grid + modals.

### Admin dashboard
- **User management** — search/filter users, edit name/email/role, delete accounts.
- **Content management** — full CRUD for series/movies, live type filtering, multi-field search with stackable filter chips, **sortable table columns** (click a header to sort ascending/descending by title, year, type, genre, or rating).
- **Statistics dashboard** — D3.js bar charts (catalog vs. watch counts by channel and by genre) and leaderboards (most-watched, most-liked), backed by MongoDB aggregation pipelines.
- **Role-gated access** — admin pages and admin-only API routes are protected by session + role middleware; non-admins are redirected.

### Platform / operational
- **Centralized logging** — every request is logged (method, path, status) to `logs/access.log`; server errors and key auth events (register/login success or failure) are logged to `logs/error.log`, each with a timestamp.
- **Authentication** — email/password accounts with hashed passwords (bcrypt) and cookie-based sessions (`express-session`).

## Tech stack

| Layer | Technology |
|---|---|
| Runtime / server | Node.js, Express 5 |
| Database / ODM | MongoDB, Mongoose |
| Auth / sessions | express-session, bcrypt |
| Frontend | Vanilla JavaScript, HTML, CSS3, Bootstrap 5 |
| Data viz | D3.js v7 |
| External APIs | Google Maps JavaScript API + Geocoder, YouTube Data API v3 |

## Project structure

```text
RetroStream/
├── src/
│   ├── server.js                    # process entry point
│   ├── app.js                       # express app: middleware, sessions, routes
│   ├── config/
│   │   └── db.js                    # MongoDB connection
│   ├── models/                      # Mongoose schemas
│   │   ├── user.model.js
│   │   ├── profile.model.js
│   │   ├── content.model.js
│   │   ├── review.model.js
│   │   └── watch-history.model.js
│   ├── controllers/                 # request handlers, one per resource
│   ├── routes/                      # Express routers, one per resource
│   ├── middleware/
│   │   ├── auth.middleware.js       # requireLogin / requireAdmin / requireAdminPage
│   │   └── profile.middleware.js    # requireProfileOwner
│   ├── utils/
│   │   └── logger.js                # access/error logging to logs/*.log
│   ├── scripts/
│   │   └── seed.js                  # seeds the database with sample content
│   ├── views/                       # server-rendered static HTML pages
│   │   ├── login.html / register.html
│   │   ├── profiles.html / account.html
│   │   ├── mainpage.html            # the main viewer app
│   │   └── admin.html / admin-users.html / admin-content.html / admin-stats.html
│   └── public/
│       ├── css/                     # one stylesheet per page + shared.css / admin-shared.css
│       ├── js/                      # one client script per page
│       └── Assets/                  # images, avatars, favicon
├── logs/                            # access.log / error.log (gitignored)
├── .env                             # environment variables (not committed)
└── package.json
```

## Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Create a `.env` file** in the project root with:
   ```bash
   # MongoDB connection string (local or MongoDB Atlas)
   MONGO_URI=mongodb://localhost:27017/RetroStream

   # any long random string, used to sign session cookies
   SESSION_SECRET=your_session_secret

   # Google Cloud Console — Maps JavaScript API + Geocoding API enabled,
   # restricted by HTTP referrer (this key is sent to the browser)
   GOOGLE_MAPS_API_KEY=your_google_maps_key

   # Google Cloud Console — YouTube Data API v3 enabled,
   # restricted to that API only (this key stays server-side)
   YOUTUBE_API_KEY=your_youtube_key
   ```

3. **Seed the database** (optional, but the catalog is empty without it) — inserts sample content, sample profiles, and one demo user:
   ```bash
   npm run seed
   ```
   Demo login: `user@example.com` / `123456`

4. **Run the server**
   ```bash
   npm start
   ```

5. **Open the app** at [http://localhost:3000](http://localhost:3000) — log in with the demo user (or register a new account), create a profile, and start browsing.

> **Getting admin access:** new/seeded users default to the `user` role, and only an existing admin can promote another user (via the admin panel or `PUT /api/users/:id`). To create your first admin, set that user's `role` field to `"admin"` directly in MongoDB (e.g. `db.users.updateOne({ email: "user@example.com" }, { $set: { role: "admin" } })` in `mongosh`/Compass), then log in again and visit `/admin`.

## API reference

All routes below are prefixed with `/api` and require an active session (login) unless noted. Routes marked **admin** additionally require an admin role.

### Auth — `/api/auth`
| Method | Path | Description |
|---|---|---|
| POST | `/register` | create a new user account |
| POST | `/login` | log in, starts a session |
| POST | `/logout` | ends the session |

### Content — `/api/content`
| Method | Path | Description |
|---|---|---|
| GET | `/` | list all content |
| GET | `/search` | multi-field search (title, genre, origin, franchise, description, year, rating range, max length, free text) |
| GET | `/discover` | category rows (recommended, genre, etc.) |
| GET | `/liked` | content liked by the active profile |
| GET | `/:id` | single content item |
| GET | `/:id/youtube` | related YouTube clip for a title |
| POST | `/` | **admin** — create content |
| PUT | `/:id` | **admin** — update content |
| DELETE | `/:id` | **admin** — delete content |
| PUT | `/:id/like` | toggle like for the active profile |

### Profiles — `/api/profiles`
| Method | Path | Description |
|---|---|---|
| GET | `/` | profiles for the logged-in user |
| GET | `/active` | the currently active profile |
| GET | `/all` | **admin** — every profile |
| GET | `/search` | **admin** — search profiles |
| GET | `/:id` | a single profile (owner only) |
| POST | `/` | create a profile |
| PUT | `/:id` | update a profile (owner only) |
| DELETE | `/:id` | delete a profile (owner only) |
| POST | `/:id/select` | set as the active profile for this session |

### Reviews — `/api/reviews`
| Method | Path | Description |
|---|---|---|
| GET | `/content/:contentId` | all reviews for a title |
| POST | `/content/:contentId` | create a review (rating 1–5 + optional text) |
| PUT | `/:id` | edit your review |
| DELETE | `/:id` | delete your review |

### Watch history — `/api/watch-history`
| Method | Path | Description |
|---|---|---|
| GET | `/continue` | in-progress titles for the active profile |
| GET | `/recommendations` | recommended titles based on watch history |
| PUT | `/progress` | save/update playback progress |
| GET | `/` | **admin** — all watch history records |
| GET | `/:id` | **admin** — a single record |
| GET | `/search` | **admin** — search watch history |
| POST | `/` | **admin** — create a record |
| PUT | `/:id` | **admin** — update a record |
| DELETE | `/:id` | delete a record |

### Users — `/api/users`
| Method | Path | Description |
|---|---|---|
| GET | `/me` | the logged-in user's own account |
| GET | `/` | **admin** — list all users |
| GET | `/search` | **admin** — search users |
| PUT | `/:id` | update a user (self or admin) |
| DELETE | `/:id` | delete a user (self or admin) |

### Stats — `/api/stats` (all **admin**)
| Method | Path | Description |
|---|---|---|
| GET | `/totals` | catalog size, total watch hours, top channel/genre |
| GET | `/by-origin` | catalog size + watch count grouped by channel |
| GET | `/by-genre` | catalog size + watch count grouped by genre |
| GET | `/top-watched` | most-watched titles leaderboard |
| GET | `/top-liked` | most-liked titles leaderboard |

### Config — `/api/config`
| Method | Path | Description |
|---|---|---|
| GET | `/maps-key` | serves the Google Maps API key from `.env` to the client (never committed to source) |

## Data model

| Model | Key fields |
|---|---|
| **User** | name, email (unique), hashed password, role (`user` / `admin`) |
| **Profile** | belongs to a user; name, avatar image, birth date |
| **Content** | title, year, type (`סדרה` / `סרט`), genre[], origin[], franchise[], rating, description, image, videoUrl, filmingLocation, episodeLength/duration, likedBy[] |
| **Review** | profile + content (unique pair), rating (1–5), text |
| **WatchHistory** | profile + content (unique pair), progress, duration, completed |

## Authentication & sessions

- Passwords are hashed with `bcrypt` before being stored — plaintext passwords are never saved or logged.
- Logging in starts an `express-session`; the signed session cookie (`SESSION_SECRET`) holds `userId` and, once a profile is picked, `activeProfileId` (1 hour expiry).
- `requireLogin` blocks every private page and API route for logged-out users, redirecting to `/`.
- `requireAdmin` / `requireAdminPage` restrict admin API routes and admin pages to users with `role: "admin"` — enforced server-side on every request, not just hidden in the UI.
- `requireProfileOwner`, plus explicit ownership checks inside the user/profile controllers, make sure a regular user can only read, edit, or delete their own profiles and account; only an admin can act on another user's data or change a role.

## Logging

Every HTTP request is logged to `logs/access.log` (method, path, status code). Server-side errors and key auth events (registration, login success/failure) are logged to `logs/error.log`. Both files are timestamped, written asynchronously, and gitignored.
