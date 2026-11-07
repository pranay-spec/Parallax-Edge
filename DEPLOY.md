# 🚀 Deployment Guide: Vercel & Render

This guide explains how to deploy the **Parallax Edge** application using **Vercel** for the frontend and **Render** for the backend.

## Prerequisites

1.  **GitHub Repository**: Ensure your project is pushed to a GitHub repository.
2.  **Accounts**: Create accounts on [Vercel](https://vercel.com) and [Render](https://render.com).

---

## 1. Backend Deployment (Render)

We will deploy the Python FastAPI backend first, as the frontend needs its URL.

### Option A: Automatic Deployment (Blueprints)
1.  Go to your [Render Dashboard](https://dashboard.render.com/).
2.  Click **New +** -> **Blueprint**.
3.  Connect your GitHub repository.
4.  Render will automatically detect the `render.yaml` file in the root.
5.  Click **Apply**.
6.  Once deployed, copy the **Service URL** (e.g., `https://parallax-edge-backend.onrender.com`).

### Option B: Manual Setup
1.  Go to your [Render Dashboard](https://dashboard.render.com/).
2.  Click **New +** -> **Web Service**.
3.  Connect your GitHub repository.
4.  **Configure the service**:
    *   **Name**: `parallax-backend`
    *   **Root Directory**: `backend` (Important!)
    *   **Runtime**: Python 3
    *   **Build Command**: `pip install -r requirements.txt`
    *   **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5.  Click **Create Web Service**.
6.  Wait for the deployment to finish and copy the **onrender.com URL**.

---

## 2. Frontend Deployment (Vercel)

Now we deploy the Next.js frontend and connect it to the backend.

1.  Go to your [Vercel Dashboard](https://vercel.com/dashboard).
2.  Click **Add New...** -> **Project**.
3.  Import your GitHub repository.
4.  **Configure Project**:
    *   **Framework Preset**: Next.js
    *   **Root Directory**: Click `Edit` and select `frontend`.
5.  **Environment Variables**:
    *   Expand the **Environment Variables** section.
    *   Add a new variable:
        *   **Key**: `NEXT_PUBLIC_API_URL`
        *   **Value**: Your Render Backend URL (e.g., `https://parallax-edge-backend.onrender.com`) **without the trailing slash**.
6.  Click **Deploy**.

---

## 3. Verification

1.  Open your Vercel deployment URL (e.g., `https://parallax-edge.vercel.app`).
2.  Try searching for a product (e.g., "iPhone", "Milk").
3.  If results appear, the frontend is successfully communicating with the backend!

### Troubleshooting
-   **CORS Errors**: Check the browser console. If you see CORS errors, ensure `backend/app/main.py` allows the Vercel domain in `CORSMiddleware`. (Currently set to allow `*` which is fine for development/testing).
-   **Backend 404**: Ensure you didn't include a trailing slash in `NEXT_PUBLIC_API_URL`.
-   **Build Failures**: Check Vercel/Render logs for specific error messages.
