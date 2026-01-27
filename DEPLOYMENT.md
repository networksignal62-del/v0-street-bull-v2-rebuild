# Production Deployment Guide

This project consists of two parts:
1. **Frontend**: Next.js application (hosted on Vercel)
2. **Backend**: Signaling Server for WebRTC (hosted separately)

## 1. Deploying the Frontend (Vercel)

The frontend is already configured for Vercel.

1.  Push this repository to GitHub.
2.  Import the project into Vercel.
3.  **Environment Variables**: You must set the `NEXT_PUBLIC_SOCKET_URL` environment variable in Vercel to point to your deployed Backend URL (see below).
    *   Example: `NEXT_PUBLIC_SOCKET_URL=https://your-signaling-server.onrender.com`

## 2. Deploying the Backend (Signaling Server)

Because Vercel (serverless) does not support long-running WebSocket connections, you **must** host the `server.js` file on a platform that supports them, such as **Render**, **Railway**, or **Heroku**.

### Deploying to Render (Free Tier available)

1.  Create a new **Web Service** on Render connected to this same GitHub repository.
2.  **Build Command**: `npm install`
3.  **Start Command**: `node server.js`
4.  Only the `server.js` and `package.json` are strictly needed for this part.
5.  Once deployed, Render will give you a URL (e.g., `https://street-bull-signaling.onrender.com`).
6.  **Copy this URL** and paste it into your Vercel Environment Variables as `NEXT_PUBLIC_SOCKET_URL`.

## Summary
-   **Vercel** hosts the pages (`/camera/join`, `/broadcast/control`, etc.).
-   **Render/Railway** hosts the socket server (`server.js`) that facilitates the video connection.
-   The two talk to each other via the `NEXT_PUBLIC_SOCKET_URL` configuration.
