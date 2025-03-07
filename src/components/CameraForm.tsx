import React, { useState } from 'react';
import { Camera, Save, X } from 'lucide-react';

interface CameraFormProps {
  onSubmit: (data: any) => void;
  onCancel: () => void;
  initialData?: any;
}

export function CameraForm({ onSubmit, onCancel, initialData }: CameraFormProps) {
  const [formData, setFormData] = useState(initialData || {
    name: '',
    location: '',
    streamUrl: '',
    type: 'IP Camera',
    faceRecognition: false,
    motionDetection: false,
    nightVision: 'auto',
    recordingMode: 'motion-based',
    storage: 'local',
  });

  const [errors, setErrors] = useState<any>({});

  const validateForm = () => {
    const newErrors: any = {};

    // Validate required fields
    if (!formData.name) {
      newErrors.name = 'Camera Name is required';
    }

    if (!formData.location) {
      newErrors.location = 'Location is required';
    }

    // Stream URL is no longer required as per your request
    // if (!formData.streamUrl) {
    //   newErrors.streamUrl = 'Stream URL is required';
    // }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0; // return false if errors exist
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Only submit if form is valid
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <Camera className="w-6 h-6" />
          {initialData ? 'Edit Camera' : 'Add New Camera'}
        </h2>
        <button
          type="button"
          onClick={onCancel}
          className="p-2 text-gray-500 hover:text-gray-700"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Camera Name
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Location
          </label>
          <select
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Location</option>
            <option value="entrance">Entrance</option>
            <option value="parking">Parking</option>
            <option value="lobby">Lobby</option>
            <option value="office">Office</option>
          </select>
          {errors.location && <p className="text-red-500 text-sm">{errors.location}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Camera Type
          </label>
          <select
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="IP Camera">IP Camera</option>
            <option value="Webcam">Webcam</option>
            <option value="CCTV">CCTV</option>
          </select>
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Stream URL (RTSP/HTTP)
          </label>
          <input
            type="text"
            value={formData.streamUrl}
            onChange={(e) => setFormData({ ...formData, streamUrl: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Night Vision Mode
          </label>
          <select
            value={formData.nightVision}
            onChange={(e) => setFormData({ ...formData, nightVision: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="auto">Auto</option>
            <option value="on">Always On</option>
            <option value="off">Always Off</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Recording Mode
          </label>
          <select
            value={formData.recordingMode}
            onChange={(e) => setFormData({ ...formData, recordingMode: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="continuous">Continuous</option>
            <option value="motion-based">Motion-based</option>
            <option value="manual">Manual</option>
          </select>
        </div>

        <div className="col-span-2 space-y-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="faceRecognition"
              checked={formData.faceRecognition}
              onChange={(e) =>
                setFormData({ ...formData, faceRecognition: e.target.checked })
              }
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label
              htmlFor="faceRecognition"
              className="ml-2 block text-sm text-gray-700"
            >
              Enable Face Recognition
            </label>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="motionDetection"
              checked={formData.motionDetection}
              onChange={(e) =>
                setFormData({ ...formData, motionDetection: e.target.checked })
              }
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label
              htmlFor="motionDetection"
              className="ml-2 block text-sm text-gray-700"
            >
              Enable Motion Detection
            </label>
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          Save Camera
        </button>
      </div>
    </form>
  );
}
