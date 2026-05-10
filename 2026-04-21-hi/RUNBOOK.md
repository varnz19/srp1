# 🚀 Solenne: Run & Deployment Guide

This guide covers how to run the Solenne Personalized Entertainment Discovery Platform locally on your machine, as well as how to deploy it to the web.

---

## 💻 How to Run Locally (Development)

To run the project on your own computer, you need to start both the Backend (Server) and the Frontend (Client) at the same time.

### 1. Start the Backend Server
Open a terminal and run the following commands:
```bash
cd server
npm install
npm run dev
```
*This will start your Node.js/Express backend, connect to MongoDB, and listen for requests (usually on `http://localhost:5006`).*

### 2. Start the Frontend Client
Open a **second, separate terminal** and run the following commands:
```bash
cd client
npm install
npm run dev
```
*This will start the Vite React development server. It will give you a local URL (like `http://localhost:5173`). Open that URL in your browser to view the app!*

---

## 🌍 How to Deploy to the Web (Production)

To make your website accessible to anyone in the world, we recommend the **Split Deployment** path. It's completely free and industry-standard.

### Step 1: Push your code to GitHub
If you haven't already, upload this entire project folder to a repository on your GitHub account.

### Step 2: Deploy the Backend to Render.com
1. Create a free account at [Render.com](https://render.com).
2. Click **New +** and select **Web Service**.
3. Connect your GitHub account and select your repository.
4. **Configuration:**
   - **Name:** `solenne-backend`
   - **Root Directory:** `server`
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start` (or `node src/index.js`)
5. **Environment Variables:** Scroll down and add all the variables from your `server/.env` file:
   - `PORT` = `10000`
   - `MONGO_URI` = `<your_mongo_atlas_connection_string>`
   - `JWT_SECRET` = `<your_secret_key>`
   - `TMDB_API_KEY` = `<your_tmdb_api_key>`
6. Click **Create Web Service**. 
*Once it finishes building, Render will give you a live URL (e.g., `https://solenne-backend.onrender.com`). Copy this URL!*

### Step 3: Deploy the Frontend to Vercel
1. Create a free account at [Vercel.com](https://vercel.com).
2. Click **Add New Project**.
3. Connect your GitHub account and import your repository.
4. **Configuration:**
   - **Framework Preset:** Vite (it should auto-detect this)
   - **Root Directory:** Click "Edit" and select `client`.
5. **Environment Variables:** 
   - Add a new variable named `VITE_API_URL`
   - Paste the live URL you copied from Render in Step 2, and add `/api` to the end. 
   - *(Example: `https://solenne-backend.onrender.com/api`)*
6. Click **Deploy**.

🎉 **You're Done!** Vercel will give you a live link (e.g., `https://solenne.vercel.app`) where you can view your fully deployed, production-ready website!
