# 🍽️ Restaurant Reservation App

A simple, full-stack restaurant reservation manager with full CRUD.
Beginner-friendly JavaScript, short comments, no extra frameworks.

- **Frontend:** React (Vite) + plain CSS
- **Backend:** Node.js + Express (REST API)
- **Database:** MongoDB (via **Mongoose** schema + **Zod** validation)
- **HTTP client:** native `fetch`

You view the data with **MongoDB Compass** (the GUI). The app talks to a
running **MongoDB server** (`mongod`) that Compass connects to.

---

## Project structure

```
restaurant-reservation/
  backend/
    server.js                 # Express app entry point
    db.js                     # Connects to MongoDB
    models/Reservation.js     # Mongoose schema (data shape)
    validation.js             # Zod schema (request validation)
    routes/reservations.js    # All CRUD endpoints
    package.json
  frontend/
    index.html
    vite.config.js
    src/
      components/
        ReservationForm.jsx   # Create + edit form
        ReservationList.jsx   # Table of reservations
        ReservationItem.jsx   # One row with Edit / Delete
      api.js                  # ALL API calls live here (fetch)
      App.jsx                 # Main layout + state
      main.jsx                # React entry point
      index.css               # All styles
    package.json
  README.md
```

---

## How frontend and backend talk

```
React (localhost:5173)  ──fetch──▶  Express API (localhost:4000/api/reservations)  ──▶  MongoDB (localhost:27017)
```

1. The browser loads the React app from Vite (`http://localhost:5173`).
2. Every API call is in **one file**: `frontend/src/api.js`, using `fetch`.
3. Those calls hit the Express server (`http://localhost:4000/api/reservations`).
4. Express uses **Mongoose** to read/write MongoDB, and **Zod** to validate input first.
5. After a create/update/delete, the frontend re-fetches the list so the table stays in sync.

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
npm start          # runs on http://localhost:4000
```

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

Base URL: `http://localhost:4000/api/reservations`

| Method | Path                    | Description                         | Success code |
|--------|-------------------------|-------------------------------------|--------------|
| GET    | `/`                     | List all (optional `?date=YYYY-MM-DD`) | 200       |
| GET    | `/:id`                  | Get one by id                       | 200          |
| POST   | `/`                     | Create a reservation                | 201          |
| PUT    | `/:id`                  | Update a reservation                | 200          |
| DELETE | `/:id`                  | Delete a reservation                | 200          |

Errors return `400` (bad input) or `404` (not found) with `{ "error": "message" }`.

### Example API requests (PowerShell)

```powershell
# CREATE
Invoke-RestMethod -Method Post -Uri http://localhost:4000/api/reservations `
  -ContentType "application/json" `
  -Body '{"customerName":"Jane Doe","phone":"+1 555 123 4567","email":"jane@example.com","date":"2026-12-01","time":"19:00","guests":4,"notes":"Birthday","status":"pending"}'

# READ all
Invoke-RestMethod -Uri http://localhost:4000/api/reservations

# READ one by date
Invoke-RestMethod -Uri "http://localhost:4000/api/reservations?date=2026-12-01"

# UPDATE (replace 1 with a real id)
Invoke-RestMethod -Method Put -Uri http://localhost:4000/api/reservations/1 `
  -ContentType "application/json" `
  -Body '{"customerName":"Jane Doe","phone":"+1 555 123 4567","date":"2026-12-01","time":"20:00","guests":2,"status":"confirmed"}'

# DELETE (replace 1 with a real id)
Invoke-RestMethod -Method Delete -Uri http://localhost:4000/api/reservations/1
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
| time          | required, between 12:00 and 23:00                  |
| guests        | required, integer 1-20                             |
| notes         | optional                                           |
| status        | `pending` (default) / `confirmed` / `cancelled`    |
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
