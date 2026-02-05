"use client";

import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function getSocket(): Socket {
    if (!socket) {
        // Automatically determine URL based on environment
        // In local dev: defaults to window.location.origin (http://localhost:3000)
        // In production: defaults to window.location.origin (https://your-app.onrender.com)
        const socketUrl = typeof window !== "undefined" ? window.location.origin : "";

        socket = io(socketUrl, {
            // CRITICAL: Must match server.js configuration. 
            // Removed specific 'path' to use default '/socket.io/' which server.js expects.
            transports: ['websocket', 'polling'],
            autoConnect: true,
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            reconnectionAttempts: Infinity,
            timeout: 20000,
            withCredentials: true, // Match server CORS settings
        });

        socket.on('connect', () => {
            console.log('✓ Socket connected:', socket?.id);
        });

        socket.on('disconnect', (reason) => {
            console.warn('⚠ Socket disconnected:', reason);
        });

        socket.on('connect_error', (error) => {
            console.error('✗ Socket connection error:', error);
        });
    }

    return socket;
}

export function disconnectSocket() {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
}
