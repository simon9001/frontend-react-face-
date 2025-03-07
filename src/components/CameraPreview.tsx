import React, { useState } from 'react';
import {
  ZoomIn,
  ZoomOut,
  Moon,
  Video,
  VideoOff,
  AlertTriangle,
  UserCheck,
  UserX,
} from 'lucide-react';

interface CameraPreviewProps {
  camera: {
    id: string;
    name: string;
    location: string;
    streamUrl: string;
    faceRecognition: boolean;
  };
}

export function CameraPreview({ camera }: CameraPreviewProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [nightMode, setNightMode] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);

  // Simulated face recognition data
  const recognizedFaces = [
    { id: 1, name: 'John Doe', authorized: true },
    { id: 2, name: 'Unknown Person', authorized: false },
  ];

  return (
    <div className="flex-1 bg-gray-900 p-6">
      <div className="relative h-full rounded-lg overflow-hidden">
        {/* Video Preview */}
        <div className="aspect-video bg-black rounded-lg relative overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1557683316-973673baf926"
            alt="Camera Feed"
            className={`w-full h-full object-cover transform scale-${zoomLevel} ${
              nightMode ? 'grayscale' : ''
            }`}
          />

          {/* Face Recognition Overlay */}
          {camera.faceRecognition && (
            <div className="absolute top-4 right-4 space-y-2">
              {recognizedFaces.map((face) => (
                <div
                  key={face.id}
                  className={`flex items-center gap-2 px-3 py-2 rounded ${
                    face.authorized
                      ? 'bg-green-500/80 text-white'
                      : 'bg-red-500/80 text-white'
                  }`}
                >
                  {face.authorized ? (
                    <UserCheck className="w-4 h-4" />
                  ) : (
                    <UserX className="w-4 h-4" />
                  )}
                  <span className="text-sm font-medium">{face.name}</span>
                </div>
              ))}
            </div>
          )}

          {/* Camera Controls */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-3 bg-black/50 rounded-full px-4 py-2">
            <button
              onClick={() => setZoomLevel(Math.max(1, zoomLevel - 0.1))}
              className="p-2 text-white hover:text-blue-400 transition-colors"
              disabled={zoomLevel <= 1}
            >
              <ZoomOut className="w-5 h-5" />
            </button>
            <button
              onClick={() => setZoomLevel(Math.min(3, zoomLevel + 0.1))}
              className="p-2 text-white hover:text-blue-400 transition-colors"
            >
              <ZoomIn className="w-5 h-5" />
            </button>
            <div className="w-px h-6 bg-gray-500" />
            <button
              onClick={() => setNightMode(!nightMode)}
              className={`p-2 transition-colors ${
                nightMode ? 'text-yellow-400' : 'text-white hover:text-yellow-400'
              }`}
            >
              <Moon className="w-5 h-5" />
            </button>
            <div className="w-px h-6 bg-gray-500" />
            <button
              onClick={() => setIsRecording(!isRecording)}
              className={`p-2 transition-colors ${
                isRecording ? 'text-red-500' : 'text-white hover:text-red-500'
              }`}
            >
              {isRecording ? (
                <VideoOff className="w-5 h-5" />
              ) : (
                <Video className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Camera Info */}
        <div className="mt-4 flex items-center justify-between text-white">
          <div>
            <h2 className="text-xl font-semibold">{camera.name}</h2>
            <p className="text-gray-400">{camera.location}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 bg-yellow-500/20 text-yellow-500 px-3 py-1 rounded-full text-sm">
              <AlertTriangle className="w-4 h-4" />
              Motion Detected
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}