import { Server } from 'socket.io';
import type { NextApiRequest, NextApiResponse } from 'next';

// Use global variables to maintain state across hot-reloads in development
// Note: In serverless (Vercel), these might reset on cold boots.
// For production robust state, use Redis/Vercel KV.
let cameras = (global as any).cameras || new Map();
let broadcasters = (global as any).broadcasters || new Map();
let viewers = (global as any).viewers || new Map();

if (process.env.NODE_ENV !== 'production') {
    (global as any).cameras = cameras;
    (global as any).broadcasters = broadcasters;
    (global as any).viewers = viewers;
}

export const config = {
    api: {
        bodyParser: false,
    },
};

export default function SocketHandler(req: NextApiRequest, res: NextApiResponse & { socket: any }) {
    // It means that socket server was already initialised
    if (res.socket.server.io) {
        res.end();
        return;
    }

    const io = new Server(res.socket.server, {
        path: '/api/socket',
        addTrailingSlash: false,
        cors: {
            origin: "*",
            methods: ["GET", "POST"]
        }
    });

    res.socket.server.io = io;

    io.on('connection', (socket) => {
        console.log('Client connected:', socket.id);

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

            console.log(`Camera joined: ${cameraName} (${operatorName}) for stream ${streamCode}`);

            // Notify broadcaster about new camera
            const broadcaster = Array.from((broadcasters as Map<any, any>).values()).find(
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
                const broadcaster = Array.from((broadcasters as Map<any, any>).values()).find(
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

            console.log(`Broadcaster joined for stream ${streamCode}`);

            // Send list of existing cameras for this stream
            const streamCameras = Array.from((cameras as Map<any, any>).entries())
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

                console.log(`Broadcaster set active camera: ${cameraId}`);

                // Notify all viewers of this stream
                const streamViewers = Array.from((viewers as Map<any, any>).entries())
                    .filter(([_, viewer]) => viewer.streamCode === streamCode);

                streamViewers.forEach(([viewerId, viewer]) => {
                    io.to(viewer.socketId).emit('active-camera-changed', { cameraId });
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

            console.log(`Viewer joined for stream ${streamCode}`);

            // Send current active camera
            const broadcaster = Array.from((broadcasters as Map<any, any>).values()).find(
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
            console.log(`WebRTC offer from ${socket.id} to ${to}`);
            io.to(to).emit('webrtc:offer', {
                from: socket.id,
                offer,
            });
        });

        // WebRTC signaling - answer
        socket.on('webrtc:answer', ({ to, answer }) => {
            console.log(`WebRTC answer from ${socket.id} to ${to}`);
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
            const streamViewers = Array.from((viewers as Map<any, any>).entries())
                .filter(([_, viewer]) => viewer.streamCode === streamCode);

            streamViewers.forEach(([_, viewer]) => {
                io.to(viewer.socketId).emit('match:update', { data });
            });
        });


        // Handle disconnection
        socket.on('disconnect', () => {
            console.log('Client disconnected:', socket.id);

            // Remove from cameras
            if (cameras.has(socket.id)) {
                const camera = cameras.get(socket.id);
                cameras.delete(socket.id);

                // Notify broadcaster
                const broadcaster = Array.from((broadcasters as Map<any, any>).values()).find(
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
    });

    console.log('Socket.IO server initialized');
    res.end();
}
