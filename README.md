# SOLENNE  
## A Personalized Entertainment Discovery Platform

Solenne is a full-stack entertainment discovery platform that delivers personalized recommendations across movies, TV shows, anime, and music. It uses a hybrid recommendation system combined with a language model layer to improve content discovery based on user preferences, mood, and behavior.

---

## Overview

Users often spend significant time deciding what to watch due to generic recommendations and lack of personalization across platforms. Solenne addresses this by combining multiple recommendation techniques and contextual signals to generate accurate and dynamic suggestions.

---

## Features

- Personalized hybrid recommendation system  
- Mood-aware ranking of content  
- Natural language-based discovery using LLMs  
- Real-time behavioral adaptation  
- Cross-platform content support (movies, TV shows, anime, music)  
- Secure authentication using JWT  
- Graceful fallback when external APIs are unavailable  

---

## Tech Stack

### Frontend

- React.js  
- Vite  

### Backend

- Node.js  
- Express.js  

### Integrations

- TMDB API   

---

## Methodology

The system follows a hybrid recommendation pipeline consisting of:

- Preference vector generation  
- Cosine similarity scoring  
- Jaccard collaborative filtering  
- Behavioral interaction scoring  
- Mood-based re-ranking  
- Trending content signals  

---

## Scoring Formula
score = cosine + behavior + mood + collaborative + trending


---

## Project Structure
solenne/

│── client/ Frontend application (React)
│── server/ Backend application (Node.js)

---

## Setup Instructions

### 1. Clone the repository
cd solenne

### 2. Navigate to project folder
cd 2026-04-21-hi

### 3. Open two terminals

---

### Terminal 1: Run Frontend
cd client
npm install
npm run dev


---

### Terminal 2: Run Backend
cd server
npm install
npm run dev


---

## Results

- Highly personalized hybrid recommendations  
- Dynamic mood-based ranking  
- Real-time behavioral adaptation  
- Cross-platform discovery  
- Stable system with API fallback support  

---

## Future Work

- Poster embedding similarity search  
- A/B testing for optimizing recommendation weights  
- Expanded Spotify-based recommendations  
- Multilingual content support  
- React Native mobile application  
- Anonymous session-based recommendations  

---

## Sustainability Goals

- SDG 9: Industry, Innovation, and Infrastructure  
- SDG 10: Reduced Inequalities through personalization  
- SDG 16: Secure and reliable digital systems  
