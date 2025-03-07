import React, { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { Shield, Users, Bell, ClipboardList, Settings, LogOut, Camera, Plus } from "lucide-react";
import axios from "axios";
import { useAppStore } from "../store";

const Layout: React.FC = () => {
  const location = useLocation();
  const { alerts, currentUser, setCurrentUser } = useAppStore();
  const unreadAlerts = alerts.filter((alert) => !alert.read).length;
  const [showLogin, setShowLogin] = useState(false);
  const [loginData, setLoginData] = useState({ username: "", password: "" });
  const [loginError, setLoginError] = useState("");

  const isActive = (path: string) => {
    return location.pathname === path ? "bg-indigo-800" : "";
  };

  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");

    try {
      const response = await axios.post("http://127.0.0.1:8000/api/login/", loginData, { withCredentials: true });

      if (response.data.user.role === "admin") {
        setCurrentUser("admin");
        setShowLogin(false);
      } else {
        setLoginError("Invalid credentials for Admin.");
      }
    } catch (error) {
      setLoginError("Login failed. Please check your credentials.");
    }
  };

  const switchUser = () => {
    if (currentUser === "admin") {
      setCurrentUser("gatekeeper");
    } else {
      setShowLogin(true); // Show login modal when switching to Admin
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-indigo-900 text-white">
        <div className="p-4">
          <div className="flex items-center space-x-2">
            <Shield size={24} />
            <h1 className="text-xl font-bold">FaceGuard</h1>
          </div>
          <p className="text-indigo-300 text-sm mt-1">AI Gate Access System</p>
        </div>

        <div className="mt-4">
          <div className="px-4 py-2 text-indigo-300 text-sm">
            Logged in as: <span className="font-semibold">{currentUser === "admin" ? "Administrator" : "Gatekeeper"}</span>
          </div>

          <nav className="mt-2">
            {currentUser === "gatekeeper" ? (
              <>
                <Link to="/" className={`flex items-center px-4 py-3 text-indigo-100 hover:bg-indigo-800 ${isActive("/")}`}>
                  <Camera size={20} className="mr-3" />
                  <span>Live Monitoring</span>
                </Link>
                <Link to="/visitors" className={`flex items-center px-4 py-3 text-indigo-100 hover:bg-indigo-800 ${isActive("/visitors")}`}>
                  <Users size={20} className="mr-3" />
                  <span>Visitor Registration</span>
                </Link>
                <Link to="/alerts" className={`flex items-center px-4 py-3 text-indigo-100 hover:bg-indigo-800 ${isActive("/alerts")}`}>
                  <Bell size={20} className="mr-3" />
                  <span>Alerts</span>
                  {unreadAlerts > 0 && (
                    <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                      {unreadAlerts}
                    </span>
                  )}
                </Link>
                <Link to="/logs" className={`flex items-center px-4 py-3 text-indigo-100 hover:bg-indigo-800 ${isActive("/logs")}`}>
                  <ClipboardList size={20} className="mr-3" />
                  <span>Access Logs</span>
                </Link>
              </>
            ) : (
              <>
                <Link to="/dashboard" className={`flex items-center px-4 py-3 text-indigo-100 hover:bg-indigo-800 ${isActive("/dashboard")}`}>
                  <Camera size={20} className="mr-3" />
                  <span>Dashboard</span>
                </Link>
              
                <Link to="/add-camera" className={`flex items-center px-4 py-3 text-indigo-100 hover:bg-indigo-800 ${isActive("/addcamera")}`}>
                  <Camera size={20} className="mr-3" />
                  <Plus size={16} className="ml-1" /> {/* Small Plus icon beside Camera */}
                  <span>Add Camera</span>
                </Link> 
                <Link to="/users" className={`flex items-center px-4 py-3 text-indigo-100 hover:bg-indigo-800 ${isActive("/users")}`}>
                  <Users size={20} className="mr-3" />
                  <span>User Management</span>
                </Link>


                <Link to="/alerts" className={`flex items-center px-4 py-3 text-indigo-100 hover:bg-indigo-800 ${isActive("/alerts")}`}>
                  <Bell size={20} className="mr-3" />
                  <span>Alerts</span>
                  {unreadAlerts > 0 && (
                    <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                      {unreadAlerts}
                    </span>
                  )}
                </Link>
                <Link to="/logs" className={`flex items-center px-4 py-3 text-indigo-100 hover:bg-indigo-800 ${isActive("/logs")}`}>
                  <ClipboardList size={20} className="mr-3" />
                  <span>Access Logs</span>
                </Link>
                <Link to="/settings" className={`flex items-center px-4 py-3 text-indigo-100 hover:bg-indigo-800 ${isActive("/settings")}`}>
                  <Settings size={20} className="mr-3" />
                  <span>System Settings</span>
                </Link>
              </>
            )}
          </nav>
        </div>

        <div className="absolute bottom-0 w-64 border-t border-indigo-800">
          <button onClick={switchUser} className="flex items-center w-full px-4 py-3 text-indigo-100 hover:bg-indigo-800">
            <LogOut size={20} className="mr-3" />
            <span>Switch to {currentUser === "admin" ? "Gatekeeper" : "Admin"}</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <Outlet />
      </div>

      {/* Admin Login Modal */}
      {showLogin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-md shadow-md w-96">
            <h2 className="text-lg font-bold mb-4">Admin Login</h2>
            {loginError && <p className="text-red-500 text-sm mb-2">{loginError}</p>}
            <form onSubmit={handleLoginSubmit}>
              <label className="block mb-2">
                <span className="text-gray-700">Username</span>
                <input
                  type="text"
                  name="username"
                  value={loginData.username}
                  onChange={handleLoginChange}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                />
              </label>
              <label className="block mb-4">
                <span className="text-gray-700">Password</span>
                <input
                  type="password"
                  name="password"
                  value={loginData.password}
                  onChange={handleLoginChange}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                />
              </label>
              <div className="flex justify-end space-x-2">
                <button type="button" onClick={() => setShowLogin(false)} className="px-4 py-2 bg-gray-300 rounded-md">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md">
                  Login
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Layout;
