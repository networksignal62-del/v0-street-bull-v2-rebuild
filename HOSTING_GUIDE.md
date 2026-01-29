# Hosting Guide: Railway & Render

This guide explains how to deploy your **Street Bull** platform to Railway or Render. These platforms support **persistent Node.js servers**, which are required for high-performance Socket.IO and WebRTC features that Vercel's serverless environment sometimes struggles with.

---

## Why Railway or Render?
- **Real-time WebSockets**: No 400 Bad Request errors.
- **Persistent Connections**: The server remembers connected cameras and viewers without timing out.
- **Improved Video Handshakes**: WebRTC signaling is much faster and more reliable.

---

## 🚀 Option 1: Railway (Highly Recommended)
Railway is the easiest platform for persistent Node.js servers.

### Steps:
1.  **Log in**: Go to [Railway.app](https://railway.app) and sign in with your GitHub account.
2.  **New Project**: Click **"New Project"** -> **"Deploy from GitHub repo"**.
3.  **Select Repo**: Choose your `v0-street-bull-v2-rebuild` repository.
4.  **Add Domain**: 
    - Once the service is created, go to the **Settings** tab.
    - Click **"Generate Domain"** to get a public URL for your site.
5.  **Environment Variables**:
    - Go to the **Variables** tab.
    - Add `NODE_ENV=production`.
    - (Railway automatically handles the `PORT`).
6.  **Deploy**: Railway will automatically detect your `server.js` and start the server.

---

## 🌍 Option 2: Render
Render is another excellent choice with a robust persistent runtime.

### Steps:
1.  **Log in**: Go to [Render.com](https://render.com) and connect your GitHub.
2.  **Create Service**: Click **"New +"** -> **"Web Service"**.
3.  **Select Repo**: Select your `v0-street-bull-v2-rebuild` repository.
4.  **Configure Build & Start**:
    - **Language**: `Node`
    - **Build Command**: `npm install && npm run build`
    - **Start Command**: `npm start`
5.  **Environment Variables**:
    - Click **"Advanced"**.
    - Add `NODE_ENV=production`.
6.  **Deploy**: Render will build the Next.js app and run the `server.js` automatically.

---

## 🛠️ Post-Deployment Configuration

Once your app is live on Railway or Render, you need to update one variable in your client-side code so the browser knows exactly where to find your new persistent server.

### 1. The Socket.IO URL
If your site is hosted at `https://street-bull.up.railway.app`, ensure the following:
- The app is configured to use the same origin for sockets (our current code already does this by using relative paths, so it should work automatically!).

### 2. Testing Your New Setup
1.  Go to your new URL.
2.  Open the **Broadcaster** control.
3.  Connect a camera from your phone by scanning the QR code.
4.  You will notice the connection is **instant and never drops**, even if the page sits idle for a long time.

---

## 🆘 Troubleshooting
- **Build Fails?** Check that your `package.json` contains the latest changes (I updated the `start` script to `node server.js`).
- **502 Bad Gateway?** Wait 2 minutes for the build to finish. If it persists, check the "Logs" tab on Railway/Render to see if `server.js` crashed.
