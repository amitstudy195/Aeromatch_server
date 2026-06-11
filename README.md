# AeroMatch - Contextual Car Research Platform

AeroMatch is a premium MERN stack application designed to guide buyers from purchase uncertainty ("I don't know what to buy") to absolute purchasing confidence. Instead of forcing buyers to filter through obscure technical jargon (like wheelbase size or engine displacement), AeroMatch utilizes a proprietary **Contextual Matching** engine to translate real-world lifestyle profiles into data-driven car shortlists.

---

## 🚀 Key Features

*   **Preference Profiler Quiz**: A sleek 3-step profile quiz capturing target budget, everyday use case, and primary priorities (Safety, Efficiency, Cargo, or Cost).
*   **Segment-Aligned Scoring**: Matches buyers with vehicles in their exact price class (utilizing soft boundaries and extreme segment culling).
*   **Radical Culler Engine**: Actively explains *why* a particular budget-fitting car was excluded from their final list due to safety or efficiency tradeoffs.
*   **Interactive Dealership Companion**: An active checklist and custom-generated dealer conversation starters tailored specifically to their Top 3 shortlist.
*   **Owner Sentiment Parser**: Sentiment scoring based on actual user reviews (separating "The Love" from "The Catch" for each recommended model).

---

## 🛠️ Project Structure

```bash
car/
├── client/                 # React Frontend (Vite + Tailwind CSS v4)
│   ├── src/
│   │   ├── components/     # App components (Quiz, ResultMatrix, ConfidenceCompanion, etc.)
│   │   ├── App.jsx         # App view state controller
│   │   └── index.css       # Core styling & Tailwind imports
│   └── .env                # Client environment variables
│
├── server/                 # Express Backend (Node.js + MongoDB)
│   ├── config/             # DB Connection Config
│   ├── controllers/        # Recommendations scoring logic
│   ├── models/             # Mongoose Car schemas
│   ├── routes/             # API routes definition
│   ├── seed.js             # 19-car seed database script
│   └── .env                # Server environment variables
│
├── README.md               # Workspace and startup guide
└── ABOUT.md                # Proprietary scoring methodology
```

---

## ⚙️ Environment Configuration

### Server Environment (`server/.env`)
Create a `.env` file inside the `server/` directory:
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/car_research
```

### Client Environment (`client/.env`)
Create a `.env` file inside the `client/` directory:
```env
VITE_API_URL=http://localhost:5000/api/recommendations
```

---

## ⚡ Setup & Execution

### 1. Prerequisite: Local MongoDB
Ensure your local MongoDB daemon is running:
```bash
mongod
```

### 2. Backend Setup
From the project root, navigate to the `server/` directory:
```bash
cd server
npm install
```

#### Seed the Database:
To populate the database with the mock car portfolio, run:
```bash
npm run seed
```

#### Start the Server (Dev mode):
```bash
npm run dev
```
The server will boot on `http://localhost:5000`.

### 3. Frontend Setup
From the project root, navigate to the `client/` directory in a new terminal window:
```bash
cd client
npm install
```

#### Start the Client (Dev mode):
```bash
npm run dev
```
The Vite development server will start on `http://localhost:5173`.

#### Build for Production:
```bash
npm run build
```
Production assets compile to `client/dist/`, which are dynamically served by the Express backend.

---

## 🧪 API Specifications

### `POST /api/recommendations`
Expects a JSON payload matching user lifestyle criteria.

*   **Body Params**:
    *   `budget` (Number): User's target maximum budget.
    *   `primaryUse` (String): `'city_commute'`, `'family_hauler'`, `'road_trips'`, or `'weekend_adventure'`.
    *   `mustHave` (String): `'safety'`, `'fuel_efficiency'`, `'cargo_space'`, or `'low_cost'`.

*   **Example Response**:
    ```json
    {
      "recommendations": [
        {
          "make": "Volvo",
          "model": "XC90",
          "price": 56000,
          "matchPercentage": 99,
          "explanation": "..."
        }
      ],
      "radicalCuller": { ... }
    }
    ```
