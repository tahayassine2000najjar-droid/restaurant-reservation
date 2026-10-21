# 🍽️ Restaurant Reservation App

A simple, full-stack restaurant reservation manager with two sides:

- **Guest** — sends a reservation request with a form (no login needed).
- **Restaurant team** (one "reception team" role) — logs in with **JWT** to search,
  filter, accept, decline or **delete** reservations. Once logged in, it only
  ever sees the reservations dashboard (Home and the guest form are hidden).

Beginner-friendly JavaScript, no extra frameworks.

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
        Navbar.jsx            # Logged out: Home / Reservations / Team login
                              # Logged in: Reservations + username + Logout ONLY
        ReservationForm.jsx   # Guest form (create only)
        TrackReservations.jsx # Guest: find his requests by phone + booking code
        ReservationList.jsx   # Table of reservations
        ReservationItem.jsx   # One row: Accept / Decline / Delete (inline Yes-No confirm)
      pages/
        Home.jsx              # Entry screen: guest or restaurant team (logged out only)
        Reservations.jsx      # GUEST page: the form + the requests sent from this browser
        Login.jsx             # TEAM page: login form
        Team.jsx              # TEAM page: list, search, filter, accept/decline/delete
      api.js                  # ALL API calls live here (fetch)
      auth.js                 # Saves the team session in localStorage
      App.jsx                 # Holds the page + session, renders the right page
                              # (session exists => the Team dashboard for EVERY route,
                              #  so the reception login never reaches Home or the guest form)
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
   saved with the status `pending` and a **booking code** (example `R-7K2QM`)
   returned to the guest. **Below the form**, the guest follows his own
   requests with just his **phone number** (+ the booking code if kept):
   `GET /api/reservations/track?phone=…` works from **any device**, no
   account. While a request is `pending` the guest can cancel it himself
   (`PATCH /api/reservations/:id/cancel`, the phone must match).
4. The **team** logs in → `POST /api/auth/login` returns a JWT, saved in
   `localStorage`. Every team request then carries
   `Authorization: Bearer <token>`. From that moment the navbar only shows
   **Reservations** + **Logout**, and `App.jsx` renders the dashboard for every
   route: Home and the guest booking form are unreachable until logout.
5. The team page calls `GET /api/reservations?search=…&date=…` for the list,
   `PATCH /api/reservations/:id/status` to accept (`confirmed`) or
   decline (`cancelled`), and `DELETE /api/reservations/:id` to remove a row
   for good (the **Delete** button on every row → inline *Yes, delete / No*
   confirmation in the row, no popup).
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

| Username    | Password        | Role           |
|-------------|-----------------|----------------|
| `admin`     | `admin123`      | reception team |
| `reception` | `reception123`  | reception team |

They live in the `users` collection — change or delete them whenever you want.
Both accounts share the single **reception team** role: it manages the
requests (search, filter, accept, decline, delete). The username `admin` is
just a login name, not a separate role.

**What the reception login can reach:** the reservations dashboard, and only
that. Home and the guest booking form are for logged-out visitors — the navbar
stops showing them after login and `App.jsx` renders the dashboard whatever
route is asked for. All team routes (list, status, update, **delete**) are
protected by `requireTeam`: no valid JWT → `401`.

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
| GET    | `/reservations/track`      | anyone (guest)| `?phone=…` (+ optional `&code=R-7K2QM`) → the guest's own requests | 200 |
| GET    | `/reservations/:id`        | anyone        | Get one by id                                               | 200     |
| POST   | `/reservations`            | anyone (guest)| Create a request — status `pending` + a booking code        | 201     |
| PATCH  | `/reservations/:id/cancel` | anyone (guest)| Guest cancels his OWN pending request, `{ "phone": "…" }` must match | 200 |
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
# The answer contains his bookingCode (example R-7K2QM)
Invoke-RestMethod -Method Post -Uri http://localhost:4000/api/reservations `
  -ContentType "application/json" `
  -Body '{"customerName":"Jane Doe","phone":"+1 555 123 4567","email":"jane@example.com","date":"2026-12-01","time":"19:00","guests":4,"notes":"Birthday"}'

# GUEST: track his own requests with his phone, from any device (code optional)
Invoke-RestMethod -Uri "http://localhost:4000/api/reservations/track?phone=+15551234567"

# GUEST: cancel his own PENDING request (the phone must match)
Invoke-RestMethod -Method Patch -Uri http://localhost:4000/api/reservations/<id>/cancel `
  -ContentType "application/json" -Body '{"phone":"+1 555 123 4567"}'

# TEAM: list, with search + filter combined
Invoke-RestMethod -Uri "http://localhost:4000/api/reservations?date=2026-12-01&search=jane" -Headers $h

# TEAM: accept  (replace <id> with a real id)
Invoke-RestMethod -Method Patch -Uri http://localhost:4000/api/reservations/<id>/status `
  -Headers $h -ContentType "application/json" -Body '{"status":"confirmed"}'

# TEAM: decline
Invoke-RestMethod -Method Patch -Uri http://localhost:4000/api/reservations/<id>/status `
  -Headers $h -ContentType "application/json" -Body '{"status":"cancelled"}'

# TEAM: delete a row permanently (what the Delete button does - ask twice: Yes, delete / No)
Invoke-RestMethod -Method Delete -Uri http://localhost:4000/api/reservations/<id> -Headers $h
```

---

## Reservation fields

| Field         | Rules                                              |
|---------------|----------------------------------------------------|
| id            | auto-generated                                     |
| customerName  | required                                           |
| phone         | required, 7-15 digits                              |
| phoneDigits   | auto: the phone with only its digits (used by the track search) |
| bookingCode   | auto: short code given to the guest, e.g. `R-7K2QM` |
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
