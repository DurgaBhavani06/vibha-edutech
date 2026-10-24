# 🌐 Hosting VIBHA EdTech Platform using GitHub

Your repository is live at:  
👉 **[https://github.com/DurgaBhavani06/vidha-edutech](https://github.com/DurgaBhavani06/vidha-edutech)**

Because VIBHA EdTech is a full-stack platform (**Next.js Frontend** + **FastAPI Python Backend** + **Google Cloud Firestore Database**), GitHub acts as the central source-of-truth and CI/CD trigger to host both parts live on the cloud for free with automatic updates on every `git push`.

---

## 🚀 Part 1: Host Frontend on Vercel (Free — 2 minutes)

Vercel is the official platform for Next.js and integrates natively with your GitHub repository.

1. Go to **[vercel.com](https://vercel.com)** and click **Sign Up** -> **Continue with GitHub**.
2. Click **Add New...** -> **Project**.
3. Find and click **Import** next to `DurgaBhavani06/vidha-edutech`.
4. In the configuration screen:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: Click **Edit** and select **`frontend`**
   - **Environment Variables**: Add:
     - `NEXT_PUBLIC_API_URL`: `https://<your-backend-url>/api/v1` *(or use local/temporary URL first, update once backend is live)*
5. Click **Deploy**.
6. ✨ In under 2 minutes, your frontend will be live on a custom `.vercel.app` domain with automatic global SSL/CDN!

---

## ⚡ Part 2: Host Backend on Render (Free — 3 minutes)

Render connects to your GitHub repository and runs your Python FastAPI server with Docker or native Python.

1. Go to **[render.com](https://render.com)** and sign in with **GitHub**.
2. Click **New +** -> **Web Service**.
3. Select your repository: `DurgaBhavani06/vidha-edutech`.
4. Configure the service:
   - **Name**: `vibha-backend`
   - **Region**: Singapore or Frankfurt (closest to India)
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: **Python 3** *(or Docker)*
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Instance Type**: **Free**
5. Under **Environment Variables**, add:
   - `DATABASE_BACKEND`: `firebase`
   - `FIREBASE_DATABASE_ID`: `bhavani`
   - `FIREBASE_ENABLED`: `true`
   - `FIREBASE_PROJECT_ID`: `vibha-edtech-a10c5`
   - `SECRET_KEY`: `your-secure-production-secret-key-2026`
   - `CORS_ORIGINS`: `https://<your-frontend>.vercel.app,http://localhost:3000`
6. Under **Secret Files** (in Render dashboard):
   - **Filename**: `firebase-key.json`
   - **Contents**: Paste the full JSON contents of your local `firebase-key.json`
7. Click **Create Web Service**.
8. 🚀 Your FastAPI backend is now live with a public URL like `https://vibha-backend.onrender.com`!

---

## 🔗 Part 3: Connect Frontend to Backend

1. In your **Vercel Dashboard**, go to your project -> **Settings** -> **Environment Variables**.
2. Set or update:
   ```env
   NEXT_PUBLIC_API_URL=https://vibha-backend.onrender.com/api/v1
   ```
3. Click **Redeploy** on Vercel.

---

## 🔄 Automatic Continuous Deployment (CI/CD)

A GitHub Actions workflow is already configured at:
`.github/workflows/ci.yml`

Whenever you make changes and push to GitHub:
```bash
git add .
git commit -m "Update feature"
git push origin main
```
1. **GitHub Actions** will automatically run your backend tests and build the Next.js app to ensure zero bugs.
2. **Vercel** and **Render** will automatically pull the new code and redeploy your live website seamlessly!
