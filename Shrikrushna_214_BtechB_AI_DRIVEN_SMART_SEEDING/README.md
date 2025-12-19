# AgriCare (Smart Seeding)

AgriCare is a comprehensive agricultural application designed to assist with smart seeding, crop management, and market connectivity. It features a modern MERN stack architecture integrated with a Python-based ML backend for advanced features like text-to-speech and computer vision.

## Project Structure

The project is organized into three main components:

- **Frontend** (`frontend/`): A modern React application built with Vite, TypeScript, and Shadcn/UI.
- **Backend** (`backend/`): A Node.js and Express REST API handling user authentication and data persistence.
- **ML Backend** (`ml-backend/`): A Python Flask service providing machine learning capabilities, TTS, and image analysis.

## Prerequisites

Before setting up the project, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **Python** (v3.10 or higher)
- **MongoDB** (Local instance or Atlas URI)

## Setup Instructions

Follow these steps to get the application running locally.

### 1. Backend Setup (Node.js)

The main backend handles API requests, authentication, and database connections.

```bash
cd backend
npm install
```

**Configuration:**
Create a `.env` file in the `backend` directory (if not present) and add your environment variables (PORT, MONGO_URI, JWT_SECRET, etc.).

**Run Development Server:**
```bash
npm run dev
# Server typically runs on http://localhost:5000
```

### 2. ML Backend Setup (Python)

The ML backend provides specialized AI services.

**Run Flask Server:**
```bash
cd ml-backend
python app.py
```

### 3. Frontend Setup (React)

The frontend is the user interface for the application.

```bash
cd frontend
npm install
```

**Run Development Server:**
```bash
npm run dev
# Application runs on http://localhost:5173 (default Vite port)
```

## Usage

1. **Start MongoDB**: Ensure your MongoDB instance is running.
2. **Start Backend**: Terminal 1 -> `cd backend` -> `npm run dev`
3. **Start ML Backend**: Terminal 2 -> `cd ml-backend` -> `python app.py`
4. **Start Frontend**: Terminal 3 -> `cd frontend` -> `npm run dev`
5. **Access App**: Open your browser and navigate to the frontend URL (usually `http://localhost:5173`).