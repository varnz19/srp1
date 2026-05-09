# Personalized Entertainment Discovery Platform

A production-style full-stack discovery app for movies, TV, anime, and music. It includes JWT authentication, onboarding preferences, watchlists, behavior tracking, external API integrations, and a hybrid recommendation engine with content-based scoring, collaborative signals, preference vectors, cosine similarity, mood models, and an OpenAI-backed explanation/chat layer.

## Stack

- React + Vite, Tailwind CSS, Framer Motion
- Node.js, Express, MongoDB, Mongoose
- JWT auth with protected routes
- TMDB, YouTube, Spotify, and OpenAI integration layers with local fallbacks

## Quick Start

1. Install dependencies:

```bash
npm install
```

2. Create environment files:

```bash
cp .env.example server/.env
cp .env.example client/.env
```

3. Start MongoDB locally, then seed sample content:

```bash
npm run seed
```

4. Run the app:

```bash
npm run dev
```

Frontend: `http://localhost:5177`

Backend: `http://localhost:5005/api`

## Environment Variables

The app runs with seeded local content if external keys are omitted. Add these for live integrations:

- `TMDB_API_KEY`: movie and TV search/trending/details
- `YOUTUBE_API_KEY`: trailer search
- `SPOTIFY_CLIENT_ID` and `SPOTIFY_CLIENT_SECRET`: music search
- `OPENAI_API_KEY`: natural-language explanations and watch-tonight assistant

## New API Endpoints

```text
GET /api/movies/trending
GET /api/movies/popular
GET /api/movies/:id
GET /api/tv/trending
GET /api/recommendations?query=mind-bending sci-fi like Interstellar but shorter
POST /api/recommendations/assistant
GET /api/recommendations/random
```

## Catalog Sync

If `TMDB_API_KEY` is configured, the backend runs an initial TMDB sync on boot and refreshes trending/popular content every 24 hours.

## Project Structure

```text
client/
  src/components       Shared UI
  src/context          Auth state
  src/lib              API client/helpers
  src/pages            Route screens
server/
  src/config           DB config
  src/controllers      Request handlers
  src/data             Seed content
  src/middleware       Auth/error middleware
  src/models           Mongoose schemas
  src/routes           Express routers
  src/services         Recommender/API/AI logic
  src/utils            Math/security helpers
```

## Recommendation Engine

The recommender combines:

- Preference vectors from onboarding genres, moods, people, and platforms
- Content vectors from genres, tags, people, rating, popularity, year, and type
- Cosine similarity for content-based matching
- Collaborative filtering from users with similar interaction histories
- Behavioral weights from clicks, saves, dismisses, favorites, completion, and time spent
- Mood feature boosts for dynamic “happy”, “dark”, “thrilling”, “emotional”, and “chill” discovery
- LLM explanations via OpenAI, falling back to deterministic local explanations when no key is configured

## Useful Scripts

```bash
npm run dev       # client and server together
npm run seed      # populate MongoDB with sample content
npm run build     # production frontend build
npm run start     # start Express server
```
