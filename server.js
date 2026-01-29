const { createServer } = require('http');
const { Server } = require('socket.io');
const next = require('next');
const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = parseInt(process.env.PORT || '3000');

// Create Next.js app
const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

// Store active connections
const cameras = new Map(); // cameraId -> { socketId, name, operator, streamCode }
const broadcasters = new Map(); // broadcasterId -> { socketId, streamCode, activeCameraId }
const viewers = new Map(); // viewerId -> { socketId, streamCode }

app.prepare().then(() => {
    const httpServer = createServer(handler);

    const io = new Server(httpServer, {
        cors: {
            origin: '*',
            methods: ['GET', 'POST'],
            credentials: false,
        },
        transports: ['websocket', 'polling'],
        pingInterval: 25000,
        pingTimeout: 60000,
        maxHttpBufferSize: 1e6,
    });

    io.on('connection', (socket) => {
        console.log('✓ Client connected:', socket.id);

        // Camera joins broadcast
        socket.on('camera:join', ({ streamCode, cameraName, operatorName }) => {
            const cameraId = socket.id;
            cameras.set(cameraId, {
                socketId: socket.id,
                name: cameraName,
                operator: operatorName,
                streamCode,
                status: 'connecting',
            });

            console.log(
                `✓ Camera joined: ${cameraName} (${operatorName}) for stream ${streamCode}`
            );

            // Notify broadcaster about new camera
            const broadcaster = Array.from(broadcasters.values()).find(
                (b) => b.streamCode === streamCode
            );
            if (broadcaster) {
                io.to(broadcaster.socketId).emit('camera:new', {
                    cameraId,
                    name: cameraName,
                    operator: operatorName,
                });
            }

            socket.emit('camera:joined', { cameraId });
        });

        // Camera is ready to stream
        socket.on('camera:ready', ({ cameraId }) => {
            const camera = cameras.get(cameraId);
            if (camera) {
                camera.status = 'live';
                cameras.set(cameraId, camera);

                // Notify broadcaster
                const broadcaster = Array.from(broadcasters.values()).find(
                    (b) => b.streamCode === camera.streamCode
                );
                if (broadcaster) {
                    io.to(broadcaster.socketId).emit('camera:status', {
                        cameraId,
                        status: 'live',
                    });
                }
            }
        });

        // Broadcaster creates/joins broadcast
        socket.on('broadcaster:join', ({ streamCode }) => {
            const broadcasterId = socket.id;
            broadcasters.set(broadcasterId, {
                socketId: socket.id,
                streamCode,
                activeCameraId: null,
            });

            console.log(`✓ Broadcaster joined for stream ${streamCode}`);

            // Send list of existing cameras for this stream
            const streamCameras = Array.from(cameras.entries())
                .filter(([_, cam]) => cam.streamCode === streamCode)
                .map(([id, cam]) => ({
                    cameraId: id,
                    name: cam.name,
                    operator: cam.operator,
                    status: cam.status,
                }));

            socket.emit('broadcaster:cameras', { cameras: streamCameras });
        });

        // Broadcaster sets active camera
        socket.on('broadcaster:set-active-camera', ({ cameraId, streamCode }) => {
            const broadcaster = broadcasters.get(socket.id);
            if (broadcaster) {
                broadcaster.activeCameraId = cameraId;
                broadcasters.set(socket.id, broadcaster);
                console.log(`✓ Broadcaster set active camera: ${cameraId}`);

                // Notify camera to start streaming
                const camera = cameras.get(cameraId);
                if (camera) {
                    io.to(cameraId).emit('start:stream');
                }

                // Notify all viewers of this stream
                const streamViewers = Array.from(viewers.entries()).filter(
                    ([_, viewer]) => viewer.streamCode === streamCode
                );
                streamViewers.forEach(([viewerId, viewer]) => {
                    io.to(viewer.socketId).emit('active-camera-changed', {
                        cameraId,
                    });
                });
            }
        });

        // Viewer joins to watch
        socket.on('viewer:join', ({ streamCode }) => {
            const viewerId = socket.id;
            viewers.set(viewerId, {
                socketId: socket.id,
                streamCode,
            });

            console.log(`✓ Viewer joined for stream ${streamCode}`);

            // Send current active camera
            const broadcaster = Array.from(broadcasters.values()).find(
                (b) => b.streamCode === streamCode
            );
            if (broadcaster && broadcaster.activeCameraId) {
                socket.emit('active-camera-changed', {
                    cameraId: broadcaster.activeCameraId,
                });
            }
        });

        // WebRTC signaling - offer
        socket.on('webrtc:offer', ({ to, offer }) => {
            console.log(`→ WebRTC offer from ${socket.id.substring(0, 6)} to ${to.substring(0, 6)}`);
            io.to(to).emit('webrtc:offer', {
                from: socket.id,
                offer,
            });
        });

        // WebRTC signaling - answer
        socket.on('webrtc:answer', ({ to, answer }) => {
            console.log(`← WebRTC answer from ${socket.id.substring(0, 6)} to ${to.substring(0, 6)}`);
            io.to(to).emit('webrtc:answer', {
                from: socket.id,
                answer,
            });
        });

        // WebRTC signaling - ICE candidate
        socket.on('webrtc:ice-candidate', ({ to, candidate }) => {
            io.to(to).emit('webrtc:ice-candidate', {
                from: socket.id,
                candidate,
            });
        });

        // Broadcaster sends message to camera
        socket.on('broadcaster:message', ({ cameraId, message }) => {
            io.to(cameraId).emit('broadcaster:message', { message });
        });

        // Match updates (score, time, status)
        socket.on('match:update', ({ streamCode, data }) => {
            // Broadcast to all viewers of this stream
            const streamViewers = Array.from(viewers.entries()).filter(
                ([_, viewer]) => viewer.streamCode === streamCode
            );
            streamViewers.forEach(([_, viewer]) => {
                io.to(viewer.socketId).emit('match:update', { data });
            });
        });

        // Handle disconnection
        socket.on('disconnect', () => {
            console.log('✗ Client disconnected:', socket.id.substring(0, 6));

            // Remove from cameras
            if (cameras.has(socket.id)) {
                const camera = cameras.get(socket.id);
                cameras.delete(socket.id);

                // Notify broadcaster
                const broadcaster = Array.from(broadcasters.values()).find(
                    (b) => b.streamCode === camera.streamCode
                );
                if (broadcaster) {
                    io.to(broadcaster.socketId).emit('camera:disconnected', {
                        cameraId: socket.id,
                    });
                }
            }

            // Remove from broadcasters
            if (broadcasters.has(socket.id)) {
                broadcasters.delete(socket.id);
            }

            // Remove from viewers
            if (viewers.has(socket.id)) {
                viewers.delete(socket.id);
            }
        });

        // Error handling
        socket.on('error', (error) => {
            console.error('Socket error:', error);
        });
    });

    httpServer
        .once('error', (err) => {
            console.error('Server error:', err);
            process.exit(1);
        })
        .listen(port, () => {
            console.log(`\n✓ Server ready on http://${hostname}:${port}`);
            console.log(`✓ Socket.IO server running\n`);
        });
});
