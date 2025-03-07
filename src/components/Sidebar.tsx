import React from 'react';
import { Camera, Plus, Settings, Trash2, Edit } from 'lucide-react';

interface CameraItem {
  id: string;
  name: string;
  location: string;
  type: string;
  status: 'active' | 'inactive';
}

interface SidebarProps {
  cameras: CameraItem[];
  onSelectCamera: (id: string) => void;
  onAddCamera: () => void;
  onEditCamera: (id: string) => void;
  onDeleteCamera: (id: string) => void;
  selectedCameraId: string | null;
}

export function Sidebar({
  cameras,
  onSelectCamera,
  onAddCamera,
  onEditCamera,
  onDeleteCamera,
  selectedCameraId,
}: SidebarProps) {
  return (
    <div className="w-64 bg-gray-800 text-white h-screen p-4 flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Camera className="w-5 h-5" />
          Cameras
        </h2>
        <button
          onClick={onAddCamera}
          className="p-2 bg-blue-500 rounded-full hover:bg-blue-600 transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {cameras.map((camera) => (
          <div
            key={camera.id}
            className={`mb-2 p-3 rounded-lg ${
              selectedCameraId === camera.id
                ? 'bg-blue-600'
                : 'bg-gray-700 hover:bg-gray-600'
            } transition-colors cursor-pointer`}
          >
            <div
              className="flex items-center justify-between"
              onClick={() => onSelectCamera(camera.id)}
            >
              <div className="flex-1">
                <h3 className="font-medium">{camera.name}</h3>
                <p className="text-sm text-gray-300">{camera.location}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs bg-gray-600 px-2 py-1 rounded">
                    {camera.type}
                  </span>
                  <span
                    className={`w-2 h-2 rounded-full ${
                      camera.status === 'active' ? 'bg-green-500' : 'bg-red-500'
                    }`}
                  />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditCamera(camera.id);
                  }}
                  className="p-1.5 bg-gray-600 rounded hover:bg-gray-500 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteCamera(camera.id);
                  }}
                  className="p-1.5 bg-red-600 rounded hover:bg-red-500 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
