"use client";

import { useEffect, useRef, useState } from 'react';
import { getUserMedia, stopMediaStream, getMediaErrorMessage, getMediaConstraints } from '@/lib/webrtc';

interface UseMediaStreamOptions {
    quality?: '480p' | '720p' | '1080p';
    facingMode?: 'user' | 'environment';
    autoStart?: boolean;
}

export function useMediaStream(options: UseMediaStreamOptions = {}) {
    const { quality = '720p', facingMode = 'environment', autoStart = false } = options;

    const [stream, setStream] = useState<MediaStream | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const streamRef = useRef<MediaStream | null>(null);

    const startStream = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const constraints = getMediaConstraints(quality);
            constraints.video = {
                ...constraints.video,
                facingMode,
            };

            const mediaStream = await getUserMedia(constraints);
            streamRef.current = mediaStream;
            setStream(mediaStream);
        } catch (err: any) {
            const errorMessage = getMediaErrorMessage(err);
            setError(errorMessage);
            console.error('Media stream error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const stopStream = () => {
        if (streamRef.current) {
            stopMediaStream(streamRef.current);
            streamRef.current = null;
            setStream(null);
        }
    };

    const switchCamera = async (newFacingMode: 'user' | 'environment') => {
        if (streamRef.current) {
            stopStream();
            await startStream();
        }
    };

    useEffect(() => {
        if (autoStart) {
            startStream();
        }

        return () => {
            stopStream();
        };
    }, []);

    return {
        stream,
        error,
        isLoading,
        startStream,
        stopStream,
        switchCamera,
    };
}
