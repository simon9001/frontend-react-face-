import React, { useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";
import { AlertTriangle } from "lucide-react";

// Load Alert Sound
const alertSound = new Audio("/alert.mp3");

const LiveMonitoring: React.FC = () => {
  // Video & Canvas References
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // State Management
  const [faces, setFaces] = useState<any[]>([]);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [faceMatcher, setFaceMatcher] = useState<faceapi.FaceMatcher | null>(null);

  // Camera & View Mode States
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string | null>(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isNightVision, setIsNightVision] = useState(false);

  // Search & Image Upload States
  const [searchQuery, setSearchQuery] = useState("");
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [uploadResult, setUploadResult] = useState<string | null>(null);

  // Alerts & Visitor Management
  const [unauthorizedDetected, setUnauthorizedDetected] = useState(false);
  const [alertLogs, setAlertLogs] = useState<{ time: string; label: string }[]>([]);
  const [visitorRequests, setVisitorRequests] = useState<{ id: number; name: string; time: string }[]>([]);
  const [approvedVisitors, setApprovedVisitors] = useState<{ name: string; expiry: number }[]>([]);

  // Load Face Detection Models
  useEffect(() => {
    loadModels();
    getAvailableCameras();
  }, []);

  // Load AI Face Recognition Models
  const loadModels = async () => {
    await faceapi.nets.tinyFaceDetector.loadFromUri("/models");
    await faceapi.nets.faceLandmark68Net.loadFromUri("/models");
    await faceapi.nets.faceRecognitionNet.loadFromUri("/models");
    await faceapi.nets.ssdMobilenetv1.loadFromUri("/models");
    await loadLabeledDescriptors();
  };

  // Load Known Faces from Directory
  const loadLabeledDescriptors = async () => {
    const labels = ["Jacob_Kimani"]; // Add names of authorized users (match file names in known_faces/)
    const descriptors = await Promise.all(
      labels.map(async (label) => {
        const img = await faceapi.fetchImage(`/known_faces/${label}.jpg`);
        const detections = await faceapi
          .detectSingleFace(img)
          .withFaceLandmarks()
          .withFaceDescriptor();
        return new faceapi.LabeledFaceDescriptors(label, detections ? [detections.descriptor] : []);
      })
    );
    setFaceMatcher(new faceapi.FaceMatcher(descriptors, 0.6));
  };
  // Fetch Available Cameras
  const getAvailableCameras = async () => {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const videoDevices = devices.filter((device) => device.kind === "videoinput");
    setCameras(videoDevices);
    
    if (videoDevices.length > 0) {
      setSelectedCameraId(videoDevices[0].deviceId);
    }
  };

  // Start Camera with Selected Device
  const startCamera = async () => {
    if (!selectedCameraId) return;

    setIsCameraOn(true);
    
    if (videoRef.current) {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { deviceId: selectedCameraId ? { exact: selectedCameraId } : undefined },
      });

      videoRef.current.srcObject = stream;
      detectFaces();
    }
  };

  // Stop Camera and Clear Faces
  const stopCamera = () => {
    setIsCameraOn(false);
    if (videoRef.current) {
      const stream = videoRef.current.srcObject as MediaStream;
      const tracks = stream?.getTracks();
      tracks?.forEach((track) => track.stop());
      setFaces([]);
    }
  };

  // Handle Camera Selection
  const handleCameraChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCameraId(event.target.value);
    if (isCameraOn) {
      stopCamera();
      setTimeout(startCamera, 500);
    }
  };
  // Detect Faces in the Video Stream
  const detectFaces = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const displaySize = { width: video.width, height: video.height };

    faceapi.matchDimensions(canvas, displaySize);

    setInterval(async () => {
      const detections = await faceapi
        .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptors();

      const resizedDetections = faceapi.resizeResults(detections, displaySize);
      canvas.getContext("2d")?.clearRect(0, 0, canvas.width, canvas.height);

      if (faceMatcher) {
        const results = resizedDetections.map((d) => ({
          detection: d.detection,
          label: faceMatcher.findBestMatch(d.descriptor).label,
        }));

        setFaces(results);

        let unauthorizedFound = false;
        const ctx = canvas.getContext("2d");

        if (ctx) {
          resizedDetections.forEach((detection, i) => {
            const { x, y, width, height } = detection.detection.box;
            const isAlien = results[i].label === "unknown";

            ctx.strokeStyle = isAlien ? "red" : "green";
            ctx.lineWidth = 2;
            ctx.strokeRect(x, y, width, height);

            ctx.fillStyle = isAlien ? "red" : "green";
            ctx.font = "16px Arial";
            ctx.fillText(isAlien ? "Alien" : results[i].label, x, y - 5);

            if (isAlien) {
              unauthorizedFound = true;
              setAlertLogs((prevLogs) => [
                ...prevLogs,
                { time: new Date().toLocaleTimeString(), label: "Unauthorized Person Detected" },
              ]);
            }
          });

          if (unauthorizedFound) {
            if (!unauthorizedDetected) {
              alertSound.play();
            }
            setUnauthorizedDetected(true);
          } else {
            setUnauthorizedDetected(false);
          }
        }
      }
    }, 1000);
  };
  // Handle Search Input Change
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value.toLowerCase());
  };

  // Handle Image Upload & Face Recognition
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      setUploadedImage(file);

      const img = await faceapi.bufferToImage(file);
      const detection = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor();

      if (detection && faceMatcher) {
        const match = faceMatcher.findBestMatch(detection.descriptor);
        setUploadResult(match.label === "unknown" ? "Not Recognized" : `Matched: ${match.label}`);
      } else {
        setUploadResult("No face detected");
      }
    }
  };
  <div className="mb-4 flex space-x-4">
  {/* Search Bar */}
  <input
    type="text"
    placeholder="Search for a person..."
    value={searchQuery}
    onChange={handleSearch}
    className="border px-4 py-2 rounded-md w-full"
  />

  {/* File Upload */}
  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" id="uploadImage" />
  <label htmlFor="uploadImage" className="px-4 py-2 bg-blue-500 text-white rounded-md cursor-pointer">
    Upload Image
  </label>
</div>

{/* Display Upload Result */}
{uploadResult && <div className="mt-2 text-gray-700">{uploadResult}</div>}

  // Toggle Full-Screen Mode
  const toggleFullScreen = () => {
    if (videoRef.current) {
      if (!isFullScreen) {
        videoRef.current.requestFullscreen();
      } else {
        document.exitFullscreen();
      }
      setIsFullScreen(!isFullScreen);
    }
  };

  // Toggle Night Vision Mode
  const toggleNightVision = () => {
    setIsNightVision(!isNightVision);
  };
  <div className="flex space-x-4 mb-4">
  {/* Camera Selection Dropdown */}
  <select
    value={selectedCameraId || ""}
    onChange={handleCameraChange}
    className="border px-4 py-2 rounded-md"
  >
    {cameras.map((camera) => (
      <option key={camera.deviceId} value={camera.deviceId}>
        {camera.label || `Camera ${cameras.indexOf(camera) + 1}`}
      </option>
    ))}
  </select>

  {/* Full-Screen Toggle */}
  <button onClick={toggleFullScreen} className="px-4 py-2 bg-gray-700 text-white rounded-md">
    {isFullScreen ? "Exit Full Screen" : "Full Screen"}
  </button>

  {/* Night Vision Toggle */}
  <button onClick={toggleNightVision} className="px-4 py-2 bg-gray-700 text-white rounded-md">
    {isNightVision ? "Disable Night Vision" : "Enable Night Vision"}
  </button>
</div>

{/* Camera Feed with Night Vision Effect */}
<div className={`relative ${isNightVision ? "filter grayscale contrast-200" : ""}`}>
  <video ref={videoRef} autoPlay muted className="w-full h-[400px]" />
  <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full" />
</div>

  // Send Security Alert (Optional API Integration)
  const sendSecurityAlert = async () => {
    await fetch("/api/security-alert", {
      method: "POST",
      body: JSON.stringify({ message: "Unauthorized person detected", timestamp: new Date() }),
      headers: { "Content-Type": "application/json" },
    });
  };

  // Detect Unauthorized Individuals and Trigger Alerts
  const detectUnauthorizedAccess = (isAlien: boolean) => {
    if (isAlien) {
      if (!unauthorizedDetected) {
        alertSound.play();
        sendSecurityAlert(); // (Optional API Call)
      }
      setUnauthorizedDetected(true);
      setAlertLogs((prevLogs) => [
        ...prevLogs,
        { time: new Date().toLocaleTimeString(), label: "Unauthorized Person Detected" },
      ]);
    } else {
      setUnauthorizedDetected(false);
    }
  };
  {/* Live Feed with Alert Effect */}
  <div className={`relative ${unauthorizedDetected ? "border-4 border-red-500 animate-pulse" : ""}`}>
    <video ref={videoRef} autoPlay muted className="w-full h-[400px]" />
    <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full" />
  </div>

  {/* Notification Logs */}
  <div className="bg-white rounded-lg shadow-md mt-6">
    <div className="p-4 border-b">
      <h2 className="font-semibold text-lg">Security Alerts</h2>
    </div>
    <div className="p-4">
      {alertLogs.length === 0 ? (
        <div className="text-center py-8 text-gray-500">No alerts triggered.</div>
      ) : (
        alertLogs.map((log, index) => (
          <div key={index} className="border rounded-lg p-4 flex items-center bg-red-100">
            <span className="text-gray-700">{log.time} - {log.label}</span>
            <div className="ml-auto bg-red-500 text-white px-2 py-1 rounded-full">
              <AlertTriangle size={16} />
            </div>
          </div>
        ))
      )}
    </div>
  </div>
  // Approve Visitor Access for a Limited Time
  const approveVisitor = (id: number, name: string) => {
    setApprovedVisitors((prev) => [...prev, { name, expiry: Date.now() + 10 * 60 * 1000 }]); // Expires in 10 mins
    setVisitorRequests((prev) => prev.filter((visitor) => visitor.id !== id));
  };

  // Reject Visitor Access
  const rejectVisitor = (id: number) => {
    setVisitorRequests((prev) => prev.filter((visitor) => visitor.id !== id));
  };

  // Remove Expired Visitors Automatically
  useEffect(() => {
    const interval = setInterval(() => {
      setApprovedVisitors((prev) => prev.filter((visitor) => visitor.expiry > Date.now()));
    }, 1000);
    return () => clearInterval(interval);
  }, []);
  {/* Visitor Approval Panel */}
  <div className="bg-white rounded-lg shadow-md mt-6">
    <div className="p-4 border-b">
      <h2 className="font-semibold text-lg">Visitor Requests</h2>
    </div>
    <div className="p-4">
      {visitorRequests.length === 0 ? (
        <div className="text-center py-8 text-gray-500">No visitor requests.</div>
      ) : (
        visitorRequests.map((visitor) => (
          <div key={visitor.id} className="border rounded-lg p-4 flex items-center">
            <span className="text-gray-700">{visitor.name} - {visitor.time}</span>
            <button
              onClick={() => approveVisitor(visitor.id, visitor.name)}
              className="ml-auto bg-green-500 text-white px-3 py-1 rounded-md"
            >
              Approve
            </button>
            <button
              onClick={() => rejectVisitor(visitor.id)}
              className="ml-2 bg-red-500 text-white px-3 py-1 rounded-md"
            >
              Reject
            </button>
          </div>
        ))
      )}
    </div>
  </div>
  return (
    <div className="p-6 h-full flex flex-col">
      {/* Header & Camera Controls */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Live Monitoring</h1>

        {/* Camera Start/Stop Button */}
        <button
          onClick={isCameraOn ? stopCamera : startCamera}
          className={`px-4 py-2 rounded-md font-medium ${
            isCameraOn
              ? "bg-red-500 hover:bg-red-600 text-white"
              : "bg-green-500 hover:bg-green-600 text-white"
          }`}
        >
          {isCameraOn ? "Stop Camera" : "Start Camera"}
        </button>
      </div>

      {/* Camera Selection & View Mode Controls */}
      <div className="flex space-x-4 mb-4">
        {/* Camera Dropdown */}
        <select
          value={selectedCameraId || ""}
          onChange={handleCameraChange}
          className="border px-4 py-2 rounded-md"
        >
          {cameras.map((camera) => (
            <option key={camera.deviceId} value={camera.deviceId}>
              {camera.label || `Camera ${cameras.indexOf(camera) + 1}`}
            </option>
          ))}
        </select>

        {/* Full-Screen Toggle */}
        <button onClick={toggleFullScreen} className="px-4 py-2 bg-gray-700 text-white rounded-md">
          {isFullScreen ? "Exit Full Screen" : "Full Screen"}
        </button>

        {/* Night Vision Toggle */}
        <button onClick={toggleNightVision} className="px-4 py-2 bg-gray-700 text-white rounded-md">
          {isNightVision ? "Disable Night Vision" : "Enable Night Vision"}
        </button>
      </div>
      {/* Live Camera Feed with Face Detection Overlay */}
      <div className={`relative ${unauthorizedDetected ? "border-4 border-red-500 animate-pulse" : ""}`}>
        <video ref={videoRef} autoPlay muted className="w-full h-[400px]" />
        <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full" />
      </div>
      {/* Search & Manual Image Upload */}
      <div className="mb-4 flex space-x-4 mt-6">
        {/* Search Bar */}
        <input
          type="text"
          placeholder="Search for a person..."
          value={searchQuery}
          onChange={handleSearch}
          className="border px-4 py-2 rounded-md w-full"
        />

        {/* File Upload */}
        <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" id="uploadImage" />
        <label htmlFor="uploadImage" className="px-4 py-2 bg-blue-500 text-white rounded-md cursor-pointer">
          Upload Image
        </label>
      </div>

      {/* Display Upload Result */}
      {uploadResult && <div className="mt-2 text-gray-700">{uploadResult}</div>}
      {/* Security Alerts & Intrusion Logs */}
      <div className="bg-white rounded-lg shadow-md mt-6">
        <div className="p-4 border-b">
          <h2 className="font-semibold text-lg">Security Alerts</h2>
        </div>
        <div className="p-4">
          {alertLogs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No alerts triggered.</div>
          ) : (
            alertLogs.map((log, index) => (
              <div key={index} className="border rounded-lg p-4 flex items-center bg-red-100">
                <span className="text-gray-700">{log.time} - {log.label}</span>
                <div className="ml-auto bg-red-500 text-white px-2 py-1 rounded-full">
                  <AlertTriangle size={16} />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      {/* Visitor Approval Panel */}
      <div className="bg-white rounded-lg shadow-md mt-6">
        <div className="p-4 border-b">
          <h2 className="font-semibold text-lg">Visitor Requests</h2>
        </div>
        <div className="p-4">
          {visitorRequests.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No visitor requests.</div>
          ) : (
            visitorRequests.map((visitor) => (
              <div key={visitor.id} className="border rounded-lg p-4 flex items-center">
                <span className="text-gray-700">{visitor.name} - {visitor.time}</span>
                <button
                  onClick={() => approveVisitor(visitor.id, visitor.name)}
                  className="ml-auto bg-green-500 text-white px-3 py-1 rounded-md"
                >
                  Approve
                </button>
                <button
                  onClick={() => rejectVisitor(visitor.id)}
                  className="ml-2 bg-red-500 text-white px-3 py-1 rounded-md"
                >
                  Reject
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default LiveMonitoring;
