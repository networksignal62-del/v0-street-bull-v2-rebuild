// WebRTC Configuration and Utilities

export const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
  ],
};

export const MEDIA_CONSTRAINTS = {
  video: {
    width: { ideal: 1280, max: 1920 },
    height: { ideal: 720, max: 1080 },
    frameRate: { ideal: 30, max: 60 },
    facingMode: 'environment', // Default to back camera on mobile
  },
  audio: {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true,
  },
};

export const MEDIA_CONSTRAINTS_LOW = {
  video: {
    width: { ideal: 640, max: 854 },
    height: { ideal: 480, max: 480 },
    frameRate: { ideal: 24, max: 30 },
    facingMode: 'environment',
  },
  audio: {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true,
  },
};

export const MEDIA_CONSTRAINTS_HIGH = {
  video: {
    width: { ideal: 1920, max: 3840 },
    height: { ideal: 1080, max: 2160 },
    frameRate: { ideal: 60, max: 60 },
    facingMode: 'environment',
  },
  audio: {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true,
  },
};

export function getMediaConstraints(quality: '480p' | '720p' | '1080p' = '720p') {
  switch (quality) {
    case '480p':
      return MEDIA_CONSTRAINTS_LOW;
    case '1080p':
      return MEDIA_CONSTRAINTS_HIGH;
    default:
      return MEDIA_CONSTRAINTS;
  }
}

export async function getUserMedia(constraints: MediaStreamConstraints = MEDIA_CONSTRAINTS): Promise<MediaStream> {
  try {
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    return stream;
  } catch (error) {
    console.error('Error accessing media devices:', error);
    throw new Error(getMediaErrorMessage(error));
  }
}

export function getMediaErrorMessage(error: any): string {
  if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
    return 'Camera permission denied. Please allow camera access to continue.';
  } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
    return 'No camera found. Please connect a camera and try again.';
  } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
    return 'Camera is already in use by another application.';
  } else if (error.name === 'OverconstrainedError') {
    return 'Camera does not support the requested settings.';
  } else {
    return 'Failed to access camera. Please check your device settings.';
  }
}

export function stopMediaStream(stream: MediaStream | null) {
  if (stream) {
    stream.getTracks().forEach((track) => track.stop());
  }
}

export async function switchCamera(currentStream: MediaStream, facingMode: 'user' | 'environment'): Promise<MediaStream> {
  stopMediaStream(currentStream);
  
  const constraints = {
    ...MEDIA_CONSTRAINTS,
    video: {
      ...MEDIA_CONSTRAINTS.video,
      facingMode,
    },
  };
  
  return getUserMedia(constraints);
}
