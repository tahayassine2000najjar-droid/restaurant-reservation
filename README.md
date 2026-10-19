# 🍽️ Restaurant Reservation App

A simple, full-stack restaurant reservation manager with two sides:

- **Guest** — sends a reservation request with a form (no login needed).
- **Restaurant team** (admin / reception) — logs in with **JWT** to search,
  filter, accept or decline reservations.

Beginner-friendly JavaScript, short comments, no extra frameworks.

- **Frontend:** React (Vite) + plain CSS
- **Backend:** Node.js + Express (REST API) + JWT auth
- **Database:** MongoDB (via **Mongoose** schema + **Zod** validation)
- **HTTP client:** native `fetch`

You view the data with **MongoDB Compass** (the GUI). The app talks to a
running **MongoDB server** (`mongod`) that Compass connects to.

---

## Project structure

```
restaurant-reservation/
  backend/
    server.js                 # Express app entry point (+ creates team accounts)
    db.js                     # Connects to MongoDB
    .env.example              # Copy to .env (MONGO_URI, PORT, JWT_SECRET)
    middleware/auth.js        # Checks the JWT on the team routes
    models/Reservation.js     # Mongoose schema (data shape)
    models/User.js            # Team accounts (username, password, role)
    validation.js             # Zod schema (request validation)
    routes/auth.js            # POST /api/auth/login
    routes/reservations.js    # All reservation endpoints
    package.json
  frontend/
    index.html
    vite.config.js
    src/
      components/
        Navbar.jsx            # Home / Reservations / Team (team link = login only)
        ReservationForm.jsx   # Guest form (create only)
        MyReservations.jsx    # Guest list below the form: live status of the requests
        ReservationList.jsx   # Table of reservations
        ReservationItem.jsx   # One row with Accept / Decline
      pages/
        Home.jsx              # Entry screen: guest or restaurant team
        Reservations.jsx      # GUEST page: the form + the requests sent from this browser
        Login.jsx             # TEAM page: login form
        Team.jsx              # TEAM page: list, search, filter, accept/decline
      api.js                  # ALL API calls live here (fetch)
      auth.js                 # Saves the team session in localStorage
      App.jsx                 # Holds the page + session, renders the right page
                              # (admin on "Reservations" = list only, no guest form)
      main.jsx                # React entry point
      index.css               # All styles
    package.json
  README.md
```

---

## How frontend and backend talk

```
React (localhost:5173)  ──fetch──▶  Express API (localhost:4000/api)  ──▶  MongoDB (localhost:27017)
```

1. The browser loads the React app from Vite (`http://localhost:5173`).
2. Every API call is in **one file**: `frontend/src/api.js`, using `fetch`.
3. A **guest** fills the form → `POST /api/reservations` → the request is
   saved with the status `pending`. The id is remembered in `localStorage`,
   and **below the form** the guest sees "My reservations": every request
   sent from this browser with a live badge (`pending` / `confirmed` /
   `cancelled`), refreshed every 10 s and on tab focus via the public
   `GET /api/reservations/:id`.
4. The **team** logs in → `POST /api/auth/login` returns a JWT, saved in
   `localStorage`. Every team request then carries
   `Authorization: Bearer <token>`.
5. The team page calls `GET /api/reservations?search=…&date=…` for the list,
   and `PATCH /api/reservations/:id/status` to accept (`confirmed`) or
   decline (`cancelled`).
6. Express checks the token first (middleware), then uses **Mongoose** to
   read/write MongoDB and **Zod** to validate input.

CORS is enabled on the backend so the browser allows calls from `:5173` to `:4000`.

---

## Setup steps

### 0. Prerequisites
- Node.js (includes `npm`)
- A running **MongoDB server** on `mongodb://127.0.0.1:27017`
  - *MongoDB Compass alone is not enough — it's only the viewer.*
  - Easiest: install **MongoDB Community Server**, or run the bundled `mongod.exe`
    (see "Running MongoDB" below).

### 1. Backend
```powershell
cd backend
npm install
copy .env.example .env    # then open .env and set a real JWT_SECRET
npm start                 # runs on http://localhost:4000
```

On the **first start**, the server creates the two team accounts:

| Username    | Password        | Role  |
|-------------|-----------------|-------|
| `admin`     | `admin123`      | admin |
| `reception` | `reception123`  | reception |

They live in the `users` collection — change or delete them whenever you want.

### 2. Frontend (in a second terminal)
```powershell
cd frontend
npm install
npm run dev        # runs on http://localhost:5173
```

Open **http://localhost:5173** in your browser.

### 3. View data in MongoDB Compass
Open Compass and connect to: `mongodb://127.0.0.1:27017`
Then open the `restaurant_reservations` database → `reservations` collection.

---

## Running MongoDB (no-admin option)

If you don't have a MongoDB server, you can run one from a portable ZIP
(no installer / no admin rights needed):

```powershell
# Start the server (uses a local data folder)
C:\Users\HP\mongodb-local\mongodb-windows-x86_64-7.0.14\bin\mongod.exe --dbpath C:\Users\HP\mongodb-local\dbdata --port 27017
```

Leave that window open while using the app. Compass can now connect to
`mongodb://127.0.0.1:27017`.

> If you installed **MongoDB Community Server** properly, it runs as a Windows
> service automatically and you can skip the command above.

---

## API endpoints

Base URL: `http://localhost:4000/api`

| Method | Path                       | Who           | Description                                                 | Success |
|--------|----------------------------|---------------|-------------------------------------------------------------|---------|
| POST   | `/auth/login`              | anyone        | `{ username, password }` → `{ token, username, role }`      | 200     |
| GET    | `/reservations`            | **team only** | List all, with `?date=YYYY-MM-DD` and/or `?search=name`     | 200     |
| GET    | `/reservations/:id`        | anyone        | Get one by id                                               | 200     |
| POST   | `/reservations`            | anyone (guest)| Create a request — status is always `pending`               | 201     |
| PATCH  | `/reservations/:id/status` | **team only** | Accept `{"status":"confirmed"}` or decline `{"status":"cancelled"}` | 200 |
| PUT    | `/reservations/:id`        | **team only** | Update a reservation                                        | 200     |
| DELETE | `/reservations/:id`        | **team only** | Delete a reservation                                        | 200     |

**Team only** = the request must carry the login token in the header:
`Authorization: Bearer <token>`.

Errors return `400` (bad input), `401` (no/invalid token) or `404` (not found)
with `{ "error": "message" }`.

### Example API requests (PowerShell)

```powershell
# LOGIN (team) -> keeps the token for the next calls
$login = Invoke-RestMethod -Method Post -Uri http://localhost:4000/api/auth/login `
  -ContentType "application/json" `
  -Body '{"username":"admin","password":"admin123"}'
$h = @{ Authorization = "Bearer $($login.token)" }

# GUEST: create a request (no token needed, no status in the body)
Invoke-RestMethod -Method Post -Uri http://localhost:4000/api/reservations `
  -ContentType "application/json" `
  -Body '{"customerName":"Jane Doe","phone":"+1 555 123 4567","email":"jane@example.com","date":"2026-12-01","time":"19:00","guests":4,"notes":"Birthday"}'

# TEAM: list, with search + filter combined
Invoke-RestMethod -Uri "http://localhost:4000/api/reservations?date=2026-12-01&search=jane" -Headers $h

# TEAM: accept  (replace <id> with a real id)
Invoke-RestMethod -Method Patch -Uri http://localhost:4000/api/reservations/<id>/status `
  -Headers $h -ContentType "application/json" -Body '{"status":"confirmed"}'

# TEAM: decline
Invoke-RestMethod -Method Patch -Uri http://localhost:4000/api/reservations/<id>/status `
  -Headers $h -ContentType "application/json" -Body '{"status":"cancelled"}'
```

---

## Reservation fields

| Field         | Rules                                              |
|---------------|----------------------------------------------------|
| id            | auto-generated                                     |
| customerName  | required                                           |
| phone         | required, 7-15 digits                              |
| email         | optional, valid format if provided                 |
| date          | required, `YYYY-MM-DD`, not in the past            |
| time          | required, between **08:00 and 20:00**              |
| guests        | required, integer 1-20                             |
| notes         | optional                                           |
| status        | `pending` (always, on creation) / `confirmed` / `cancelled` — only the team changes it |
| createdAt     | auto-generated                                     |

**Double-booking rule:** max **5** reservations per date + time slot
(cancelled ones don't count).

---

## Validation (two layers)

- **Zod** (`backend/validation.js`) validates the incoming request body and
  returns clear error messages with proper HTTP status codes.
- **Mongoose** (`backend/models/Reservation.js`) enforces the same rules at the
  database level (required fields, enums, min/max), so data stays clean even if
  it's written directly.

Frontend also validates the form before sending, for instant feedback.
