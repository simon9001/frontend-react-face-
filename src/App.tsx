import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';
import Layout from './components/Layout';
import LiveMonitoring from './components/LiveMonitoring';
import VisitorRegistration from './components/VisitorRegistration';
import Alerts from './components/Alerts';
import AccessLogs from './components/AccessLogs';
import UserManagement from './components/UserManagement';
import AdminDashboard from './components/AdminDashboard';
import Settings from './components/Settings';
import { Sidebar } from './components/Sidebar';
import { CameraForm } from './components/CameraForm';
import { CameraPreview } from './components/CameraPreview';
import { useAppStore } from './store';

function App() {
  const { currentUser, setCurrentUser } = useAppStore();
  const [loading, setLoading] = useState(true);
  
  // Define Camera interface
  interface Camera {
    id: string;
    status: 'active' | 'inactive';
    name: string;
    location: string;
    type: string;
    streamUrl: string;
    faceRecognition: boolean;
  }

  const [cameras, setCameras] = useState<Camera[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCamera, setEditingCamera] = useState<any>(null);

  // Fetch cameras from API on component mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:8000/api/check-session/", { withCredentials: true });
        setCurrentUser(response.data.user.role); // Restore session
      } catch (error) {
        console.log("No active session found.");
      } finally {
        setLoading(false);
      }
    };

    // Fetch the cameras data
    const fetchCameras = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:8000/api/cameraslst/', { withCredentials: true });
        setCameras(response.data); // Set cameras in state
      } catch (error) {
        console.log("Error fetching cameras:", error);
      }
    };

    // Call both checkSession and fetchCameras
    checkSession();
    fetchCameras();
  }, [setCurrentUser]);

  const handleAddCamera = (data: any) => {
    const newCamera = {
      ...data,
      id: Date.now().toString(),
      status: 'active' as const,
    };
    setCameras([...cameras, newCamera]);
    setShowAddForm(false);
  };

  const handleEditCamera = (data: any) => {
    setCameras(
      cameras.map((camera) =>
        camera.id === editingCamera.id ? { ...camera, ...data } : camera
      )
    );
    setEditingCamera(null);
  };

  const handleDeleteCamera = (id: string) => {
    setCameras(cameras.filter((camera) => camera.id !== id));
    if (selectedCameraId === id) {
      setSelectedCameraId(null);
    }
  };

  const selectedCamera = cameras.find((camera) => camera.id === selectedCameraId);

  if (loading) {
    return <div className="flex h-screen items-center justify-center text-lg">Loading...</div>;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>

          {currentUser === 'gatekeeper' ? (
            <>
              <Route index element={<LiveMonitoring />} />
              <Route path="visitors" element={<VisitorRegistration />} />
              <Route path="alerts" element={<Alerts />} />
              <Route path="logs" element={<AccessLogs />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </>
          ) : currentUser === 'admin' ? (
            <>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="users" element={<UserManagement />} />
              <Route path="alerts" element={<Alerts />} />
              <Route path="logs" element={<AccessLogs />} />
              <Route path="settings" element={<Settings />} />
              
              {/* Routes for CameraForm and CameraPreview */}
              <Route path="add-camera" element={<CameraForm onSubmit={handleAddCamera} onCancel={() => setShowAddForm(false)} />} />
              <Route path="camera-preview/:cameraId" element={<CameraPreview camera={selectedCamera as any} />} />
              
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </>
          ) : (
            <Route path="*" element={<Navigate to="/login" replace />} />
          )}
        </Route>
      </Routes>

      {/* Camera Management UI */}
      <div className="flex h-screen bg-gray-100">
        <Sidebar
          cameras={cameras}
          selectedCameraId={selectedCameraId}
          onSelectCamera={setSelectedCameraId}
          onAddCamera={() => setShowAddForm(true)}
          onEditCamera={(id) => {
            const camera = cameras.find((c) => c.id === id);
            setEditingCamera(camera);
          }}
          onDeleteCamera={handleDeleteCamera}
        />
        <main className="flex-1 flex">
          {showAddForm ? (
            <div className="flex-1 p-6 bg-gray-50">
              <CameraForm
                onSubmit={handleAddCamera}
                onCancel={() => setShowAddForm(false)}
              />
            </div>
          ) : editingCamera ? (
            <div className="flex-1 p-6 bg-gray-50">
              <CameraForm
                initialData={editingCamera}
                onSubmit={handleEditCamera}
                onCancel={() => setEditingCamera(null)}
              />
            </div>
          ) : selectedCamera ? (
            <CameraPreview camera={selectedCamera} />
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <h2 className="text-2xl font-semibold text-gray-700 mb-2">
                  No Camera Selected
                </h2>
                <p className="text-gray-500">
                  Select a camera from the sidebar or add a new one to get started
                </p>
              </div>
            </div>
          )}
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
