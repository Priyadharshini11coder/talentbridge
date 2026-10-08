# TalentBridge – Production Deployment Guide (Vercel & Render)

This guide walks you through deploying **TalentBridge** with zero friction:
* **Backend**: Deployed on **Render** (Node.js/Express)
* **Frontend**: Deployed on **Vercel** (React/Vite)
* **Database**: MongoDB Atlas

---

## Part 1: Deploy Backend to Render

1. Log in to your [Render Dashboard](https://dashboard.render.com/).
2. Click **New +** → **Web Service**.
3. Connect your GitHub repository containing the TalentBridge project.
4. Configure the Web Service settings:
   * **Name**: `talentbridge-api` (or any name you choose)
   * **Root Directory**: `server`
   * **Runtime**: `Node`
   * **Build Command**: `npm install`
   * **Start Command**: `npm start`
5. Under **Environment Variables**, add:
   * `NODE_ENV` = `production`
   * `JWT_SECRET` = `talentbridge_super_secret_jwt_key_2026_prod` (or your custom secret)
   * `MONGODB_URI` = Your MongoDB Atlas connection string:
     `mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/talentbridge?retryWrites=true&w=majority`
     *(Note: If left empty or invalid, the app automatically runs on its embedded persistence store with zero crashes!)*
   * `FRONTEND_URL` = Your Vercel frontend URL (e.g. `https://talentbridge.vercel.app`)
6. Click **Deploy Web Service**.
7. Copy your deployed Render URL (e.g., `https://talentbridge-api.onrender.com`).

---

## Part 2: Deploy Frontend to Vercel

1. Log in to your [Vercel Dashboard](https://vercel.com/dashboard).
2. Click **Add New…** → **Project**.
3. Import your GitHub repository.
4. Configure the Project Settings:
   * **Framework Preset**: `Vite`
   * **Root Directory**: Click *Edit* and select `client`
   * **Build Command**: `npm run build`
   * **Output Directory**: `dist`
   * **Install Command**: `npm install`
5. Under **Environment Variables**, add:
   * `VITE_API_URL` = Your Render backend URL:
     `https://talentbridge-api.onrender.com`
6. Click **Deploy**.
7. Vercel will build your client in seconds. When done, your production website is live!

---

## Part 3: Connect Frontend and Backend CORS

Once Vercel gives you your live URL (e.g. `https://talentbridge.vercel.app`):
1. Go back to your **Render** Dashboard for the `talentbridge-api` service.
2. In the **Environment** tab, set or update:
   `FRONTEND_URL` = `https://talentbridge.vercel.app`
3. Click **Save Changes**. Render will automatically restart with the new CORS allowance.

---

## 🔑 Demo Login Credentials for Evaluation

| Role | Email | Password |
|---|---|---|
| **Student (Priyadharshini)** | `priya@example.com` | `password123` |
| **Student (Meenarevathi)** | `meena@example.com` | `password123` |
| **Admin (Dr. Ramesh Kumar)** | `admin@talentbridge.com` | `admin123` |
