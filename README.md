# Aqarak

Aqarak is a real estate platform for the Jordanian market. It uses Artificial Intelligence to help users buy, sell, and rent properties efficiently.

The platform provides advanced tools for everyone. Buyers can get fair price estimates, sellers can value their homes accurately, and renters can find exactly what they are looking for using smart search filters. Aqarak aims to make the real estate process easier and more transparent.

**Live Demo:** [Click here to view the deployed application](https://aqarak-bzu1.onrender.com)

## Key Features

- **AI Price Predictor**
  - Powered by a custom-trained **XGBoost** model.
  - Accurately estimates property values based on deep analysis of local market data: property type, location, area, finishing, age, bedrooms, bathrooms, and floor details (number of floors for villas or floor level for apartments).
  - Helps users make informed financial decisions with confidence.

- **Smart Semantic Search**
  - Move beyond basic filters. Search with natural language like *"modern apartment with a sunset view in a quiet neighborhood"* or *"spacious villa near the university"*.
  - Utilizes **OpenAI Embeddings** and **pgvector** to understand the *intent* behind your search, not just keywords.

- **Aqarak AI Concierge**
  - A sophisticated AI assistant integrated directly into the platform.
  - Context-aware: It knows about the properties you are viewing and can answer questions like *"Is this price fair for this neighborhood?"* or *"What are the legal steps to buy this home?"*.
  - RAG (Retrieval-Augmented Generation) pipeline fetches real-time legal data and property details to give accurate answers.

## Tech Stack

- **Frontend:** React, TypeScript, Tailwind CSS, GSAP, Vite
- **Backend:** Python, FastAPI, SQLAlchemy
- **Database:** PostgreSQL (with pgvector extension)
- **Storage:** AWS S3 (for image storage)
- **AI/ML:** XGBoost, OpenAI API

## Prerequisites

- Docker (for the database)
- Python 3.10 or higher
- Node.js 18 or higher

## Setup Instructions

Follow these steps to run the project.

### 1. Database and Services

This project uses Docker to run the database. Make sure Docker is running on your machine.

Start the database container:

```bash
docker-compose up -d
```

### 2. Backend Setup

Open a terminal and navigate to the backend folder:

```bash
cd backend
```

Create a virtual environment:

```bash
python -m venv venv
```

Activate the virtual environment:
- On Windows: `venv\Scripts\activate`
- On Mac/Linux: `source venv/bin/activate`

Install the required packages:

```bash
pip install -r requirements.txt
```

Run the backend server:

```bash
uvicorn app.main:app --reload
```

The backend API will be available at `http://localhost:8000`.

### 3. Frontend Setup

Open a new terminal and navigate to the frontend folder:

```bash
cd aqarak-web
```

Install the dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173`.

## Environment Variables

The project expects a `.env` file in the root or backend directory with necessary configuration (DB credentials, API keys). A default `.env` file usually exists; ensure it is configured correctly if you encounter connection issues.
