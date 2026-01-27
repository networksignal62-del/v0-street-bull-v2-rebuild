# WebRTC Video Streaming & Responsive Design - Setup Instructions

## Environment Setup

Create a `.env.local` file in the project root with:

```
NEXT_PUBLIC_SOCKET_URL=http://localhost:3000
```

## Running the Application

1. Install dependencies (already done):
```bash
pnpm install
```

2. Start the development server:
```bash
pnpm dev
```

This will start both the Next.js app and Socket.IO signaling server on `http://localhost:3000`.

## Testing the Video Streaming

### 1. Test Camera Feed
1. Open `http://localhost:3000/camera/join`
2. Fill in:
   - Stream Code: `SB-MATCH-2026-001`
   - Your Name: Any name
   - Camera Position: Select any position
3. Click "Join Broadcast"
4. Allow camera permissions when prompted
5. You should see your live camera feed

### 2. Test Broadcast Control
1. Open `http://localhost:3000/broadcast/control` in a new tab
2. You should see the camera you just connected appear in the camera grid
3. Click on the camera to make it active
4. The main preview should show the camera's video
5. Click "Go Live" to start broadcasting

### 3. Test Viewer Experience
1. Open `http://localhost:3000/watch/test-id` in a new tab
2. You should see the active camera's video stream
3. When you switch cameras in broadcast control, the viewer should automatically update

## Known Limitations

- This is a basic WebRTC implementation for demonstration
- For production, you would need:
  - TURN servers for NAT traversal
  - Better error handling and reconnection logic
  - Stream quality adaptation
  - Recording capabilities
  - Authentication and authorization

## Responsive Design

All pages are now responsive and work on:
- Mobile devices (320px+)
- Tablets (768px+)
- Desktops (1024px+)

Test by resizing your browser or using Chrome DevTools device emulation.
